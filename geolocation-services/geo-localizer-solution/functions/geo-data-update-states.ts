import { DynamoDBClient, QueryCommand, PutItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { ResourceName } from '../lib/resource-reference';
import { getCurrentTime, SupportedLanguages } from '../helpers/utilities';
import { APIGatewayProxyHandler } from 'aws-lambda';

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
    geonameId: number;
    adminCode1: string;
    adminName1: string;
    countryCode: string;
}
interface GeoNamesResponse<T> {
    geonames?: T[];
}
/**
 * AWS Lambda function that retrieves state data from GeoNames API and store it in the DynamoDB table.
 * 
 * @param event - The input event to the Lambda function, containing the request body with the `countryCode` parameter.
 * @returns The response object containing the status code and the JSON body with the results or error message.
 */
export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        const { countryCode } = JSON.parse(event.body);
        let geonameIds: number[] = [];
        let command: QueryCommand | ScanCommand;
        if (countryCode && countryCode !== '*') {
            command = new QueryCommand({
                TableName: countryTable,
                IndexName: countryTableIndex,
                KeyConditionExpression: 'countryCode = :countryCode',
                ExpressionAttributeValues: {
                    ':countryCode': { S: countryCode },
                },
                ProjectionExpression: 'geonameId',
            });
        } else {
            command = new ScanCommand({
                TableName: countryTable,
                ProjectionExpression: 'geonameId',
            });
        }
        const { Items } = await dynamoDb.send(command);
        geonameIds = Items.map(item => unmarshall(item).geonameId);
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
        // Wait for all fetch operations to complete
        const statesResults = await Promise.all(fetchStatesPromises.flat());
        const updatedAt = getCurrentTime();
        const statesMap = statesResults.flat().reduce((acc, state) => {
            const key = `${state.stateCode}#${state.geonameId}`;
            if (!acc[key]) {
                acc[key] = {
                    stateCode: state.stateCode,
                    countryCode: state.countryCode,
                    geonameId: state.geonameId,
                    ...Object.fromEntries(SupportedLanguages.map(lang => [lang, ''])),
                    updatedAt
                };
            }
            acc[key][state.language] = state.stateName;
            return acc;
        }, {} as Record<string, any>);
        // Create DynamoDB write operations for states
        const writeStatesPromises = Object.values(statesMap).map(state => {
            const entry = {
                TableName: stateTable,
                Item: marshall(state),
            };
            return dynamoDb.send(new PutItemCommand(entry));
        });
        // Wait for all DynamoDB write operations to complete for states
        await Promise.all(writeStatesPromises);
        console.info('State information updated successfully');
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'State information updated successfully' }),
        };
    } catch (error) {
        console.error('Error fetching or storing state info:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch or store state information' }),
        };
    }
};
