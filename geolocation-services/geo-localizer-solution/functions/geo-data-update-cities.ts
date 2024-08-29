import { DynamoDBClient, QueryCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { ResourceName } from '../lib/resource-reference';
import { getCurrentTime, SupportedCountries, SupportedLanguages } from '../helpers/utilities';

const dynamoDb = new DynamoDBClient({
    region: process.env.REGION,
    requestHandler: {
        requestTimeout: 3000,
        httpsAgent: { maxSockets: 25 },
    },
});

const geoNamesUrl = `http://api.geonames.org/searchJSON?username=${process.env.GEONAMES_USERNAME}&lang=$1&adminCode1=$2&country=$3&fcode=PPLA&fcode=PPLA2`;
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

exports.handler = async (event: any) => {
    const { countryCode, stateCode } = JSON.parse(event.body);

    if (!SupportedCountries.includes(countryCode)) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Attempt to update list of cities for unsupported country' }),
        };
    }

    try {
        // Step 1: Retrieve state data from DynamoDB if stateCode is '*'
        let states: string[] = [];
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

        // Step 2: Fetch and store city data for each state
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

        // Step 3: Aggregate and store city data in DynamoDB
        const updatedAt = getCurrentTime();
        const citiesMap = citiesResults.reduce((acc, city: any) => {
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
                Item: marshall(city, { removeUndefinedValues: true }),  // Remove undefined values during marshalling
            };
            return dynamoDb.send(new PutItemCommand(entry));
        });

        await Promise.all(writeCitiesPromises);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'City information stored successfully' }),
        };
    } catch (error) {
        console.error('Error fetching or storing city info:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch or store city information' }),
        };
    }
};
