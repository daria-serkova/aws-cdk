import { DynamoDBClient, QueryCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { ResourceName } from '../lib/resource-reference';
import { getCurrentTime, SupportedCountries, SupportedLanguages } from '../helpers/utilities';
import { APIGatewayProxyHandler } from 'aws-lambda';

const dynamoDb = new DynamoDBClient({
    region: process.env.REGION,
    requestHandler: {
        requestTimeout: 3000,
        httpsAgent: { maxSockets: 25 },
    },
});

const geoNamesUrl = `http://api.geonames.org/searchJSON?username=${process.env.GEONAMES_USERNAME}&lang=$1&adminCode1=$2&country=$3&fcode=PPLA&fcode=PPLA2&maxRows=1000`;
const stateTable = ResourceName.dynamoDb.GEO_DATA_STATES_TABLE;
const stateTableIndex = ResourceName.dynamoDb.GEO_DATA_INDEX_COUNTRY_CODE;
const cityTable = ResourceName.dynamoDb.GEO_DATA_CITIES_TABLE;

interface City {
    geonameId: number;
    name: string;
    adminCode1: string;
    countryCode: string;
}

interface GeoNamesResponse<T> {
    geonames?: T[];
}

/**
 * AWS Lambda function that retrieves cities data from GeoNames API and store it in the DynamoDB table.
 * 
 * @param event - The input event to the Lambda function, containing the request body with the `countryCode` and `stateCode` parameters.
 * @returns The response object containing the status code and the JSON body with the results or error message.
 */
 export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        const { countryCode, stateCode } = JSON.parse(event.body);
        let states: string[] = [];
        // Retrieve state data from DynamoDB if stateCode is '*'
        if (stateCode === '*') {
            const queryCommand = new QueryCommand({
                TableName: stateTable,
                IndexName: stateTableIndex,
                KeyConditionExpression: 'countryCode = :countryCode',
                ExpressionAttributeValues: {
                    ':countryCode': { S: countryCode },
                },
                ProjectionExpression: 'stateCode',
            });
            const { Items } = await dynamoDb.send(queryCommand);
            states = Items?.map(item => unmarshall(item).stateCode) || [];
        } else {
            states = [stateCode];
        }
        // Fetch and store city data for each state
        const fetchCitiesPromises = states.flatMap((state: string) =>
            SupportedLanguages.map(async (language) => {
                const url = geoNamesUrl.replace('$1', language)
                                      .replace('$2', state)
                                      .replace('$3', countryCode);
                const response = await fetch(url);
                const data: GeoNamesResponse<City> = await response.json();
                if (!data.geonames || !data.geonames.length) {
                    console.warn(`No city data found for stateCode ${state} and countryCode ${countryCode}`);
                    return [];
                }
                return data.geonames.map((city) => ({
                    geonameId: city.geonameId,
                    countryCode: city.countryCode,
                    stateCode: city.adminCode1,
                    language: language,
                    cityName: city.name,
                }));
            })
        );

        const citiesResults = await Promise.all(fetchCitiesPromises.flat());
        // Aggregate and store city data in DynamoDB
        const updatedAt = getCurrentTime();
        const citiesMap = citiesResults.flat().reduce((acc, city) => {
            const key = `${city.stateCode}#${city.geonameId}`;
            if (!acc[key]) {
                acc[key] = {
                    stateCode: city.stateCode,
                    countryCode: city.countryCode,
                    geonameId: city.geonameId,
                    ...Object.fromEntries(SupportedLanguages.map(lang => [lang, ''])),
                    updatedAt
                };
            }
            acc[key][city.language] = city.cityName;
            return acc;
        }, {} as Record<string, any>);

        // Remove undefined values before marshalling
        const cleanCitiesMap = Object.values(citiesMap).map(city => {
            return Object.fromEntries(
                Object.entries(city).filter(([_, value]) => value !== undefined)
            );
        });
        const writeCitiesPromises = cleanCitiesMap.map(city => {
            const entry = {
                TableName: cityTable,
                Item: marshall(city, { removeUndefinedValues: true }),
            };
            return dynamoDb.send(new PutItemCommand(entry));
        });

        await Promise.all(writeCitiesPromises);
        console.info('City information updated successfully');
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'City information updated successfully' }),
        };
    } catch (error) {
        console.error('Error fetching or storing city info:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch or store city information' }),
        };
    }
};
