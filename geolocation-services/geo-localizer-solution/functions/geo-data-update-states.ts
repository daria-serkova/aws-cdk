import { DynamoDBClient, QueryCommand, PutItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { ResourceName } from '../lib/resource-reference';
import { SupportedLanguages } from '../helpers/utilities';

const dynamoDb = new DynamoDBClient({
    region: process.env.REGION,
    requestHandler: {
        requestTimeout: 3000,
        httpsAgent: { maxSockets: 25 },
    },
});
const geoNamesUrl = `http://api.geonames.org/childrenJSON?geonameId=$1&username=${process.env.GEONAMES_USERNAME}&lang=$2`;
const countryTable = ResourceName.dynamoDb.GEO_DATA_COUNTRIES_TABLE;
const countryTableIndex = ResourceName.dynamoDb.GEO_DATA_INDEX_COUNTRY_CODE;
const stateTable = ResourceName.dynamoDb.GEO_DATA_STATES_TABLE;

interface State {
    adminCode1: string;
    adminName1: string;
    countryCode: string;
    geonameId: number;
}

interface GeoNamesResponse<T> {
    geonames?: T[];
}

exports.handler = async (event: any) => {
    const { countryCode } = JSON.parse(event.body);
    let geonameIds: number[] = [];
    try {
        // Step 1: Retrieve geonameId(s) from the country table based on the provided countryCode
        if (countryCode) {
            const queryCommand = new QueryCommand({
                TableName: countryTable,
                IndexName: countryTableIndex,
                KeyConditionExpression: 'countryCode = :countryCode',
                ExpressionAttributeValues: {
                    ':countryCode': { S: countryCode },
                },
                ProjectionExpression: 'geonameId',
            });
            const { Items } = await dynamoDb.send(queryCommand);
            if (Items && Items.length > 0) {
                geonameIds = Items.map(item => unmarshall(item).geonameId);
            } else {
                throw new Error(`No record found for countryCode: ${countryCode}`);
            }
        } else {
            const scanCommand = {
                TableName: countryTable,
                ProjectionExpression: 'geonameId',
            };

            const scanResult = await dynamoDb.send(new ScanCommand(scanCommand));
            geonameIds = scanResult.Items.map(item => unmarshall(item).geonameId);
        }

        // Step 2: Fetch state data for each geonameId in all supported languages and store them in the states table
        const fetchStatesPromises = geonameIds.flatMap((geonameId) =>
            SupportedLanguages.map(async (language) => {
                const url = geoNamesUrl.replace('$1', geonameId.toString()).replace('$2', language);
                const response = await fetch(url);
                const data: GeoNamesResponse<State> = await response.json();
                if (!data.geonames || !data.geonames.length) {
                    console.warn(`No state data found for geonameId ${geonameId} and language ${language}`);
                    return [];
                }
                return data.geonames.map((state) => ({
                    stateCode: state.adminCode1,
                    stateName: state.adminName1,
                    countryCode: state.countryCode,
                    geonameId: state.geonameId,
                    language: language,
                }));
            })
        );

        const statesResults = await Promise.all(fetchStatesPromises.flat());

        // Step 3: Aggregate and store state data in DynamoDB
        const statesMap = statesResults.flat().reduce((acc, state) => {
            const key = `${state.stateCode}#${state.geonameId}`;
            if (!acc[key]) {
                acc[key] = {
                    stateCode: state.stateCode,
                    countryCode: state.countryCode,
                    geonameId: state.geonameId,
                    ...Object.fromEntries(SupportedLanguages.map(lang => [lang, '']))
                };
            }
            acc[key][state.language] = state.stateName;
            return acc;
        }, {} as Record<string, any>);

        const writeStatesPromises = Object.values(statesMap).map(state => {
            const entry = {
                TableName: stateTable,
                Item: marshall(state),
            };
            return dynamoDb.send(new PutItemCommand(entry));
        });

        await Promise.all(writeStatesPromises);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'State information stored successfully' }),
        };
    } catch (error) {
        console.error('Error fetching or storing state info:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch or store state information' }),
        };
    }
};
