import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { ResourceName } from '../lib/resource-reference';

const dynamoDb = new DynamoDBClient({ region: process.env.REGION });
const tableName = ResourceName.dynamoDb.GEO_DATA_STATES_TABLE;
const tableIndex = ResourceName.dynamoDb.GEO_DATA_INDEX_COUNTRY_CODE;

/**
 * Lambda function to retrieve and return a list of states from a DynamoDB table, filtered by country code and language.
 * The results are sorted alphabetically by the state name in the specified language.
 * 
 * @param {APIGatewayProxyEvent} event - The event object, containing the request data.
 *   Expected JSON structure in the body:
 *   {
 *     "language": "<language_code>",   // The language code (e.g., "en", "fr") used to select the state name column.
 *     "countryCode": "<country_code>"  // The country code (e.g., "US") used to filter the states.
 *   }
 * 
 * @returns {APIGatewayProxyResult} The response object.
 *   - If successful: Returns a 200 status code with a JSON array of states, each containing:
 *     {
 *       "geonameId": <geoname_id>,  // The unique identifier for the state.
 *       "name": "<state_name>"      // The name of the state in the specified language.
 *     }
 *   - If an error occurs: Returns a 500 status code with an error message.
 * 
 * @example
 * // Input event body
 * {
 *   "language": "en",
 *   "countryCode": "US"
 * }
 * 
 * // Example response body
 * [
 *   { "geonameId": 67890, "name": "Alaska" },
 *   { "geonameId": 12345, "name": "California" },
 *   { "geonameId": 98765, "name": "Texas" }
 * ]
 */
 export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        const { language, countryCode } = JSON.parse(event.body);

        const queryCommand = new QueryCommand({
            TableName: tableName,
            IndexName: tableIndex,
            KeyConditionExpression: 'countryCode = :countryCode',
            ExpressionAttributeValues: {
                ':countryCode': { S: countryCode },
            },
            ProjectionExpression: `geonameId, ${language}`,
        });

        const result = await dynamoDb.send(queryCommand);

        const states = result.Items ? result.Items.map(item => ({
            geonameId: item.geonameId.N,
            name: item[language].S,
        })).sort((a, b) => a.name.localeCompare(b.name)) : [];

        return {
            statusCode: 200,
            body: JSON.stringify(states),
        };
    } catch (error) {
        console.error('Error retrieving states:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to retrieve states' }),
        };
    }
};
