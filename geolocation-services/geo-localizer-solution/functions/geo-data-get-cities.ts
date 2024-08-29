import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { ResourceName } from '../lib/resource-reference';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const dynamoDb = new DynamoDBClient({
    region: process.env.REGION
});

const citiesTable = ResourceName.dynamoDb.GEO_DATA_CITIES_TABLE;
const citiesTableIndex = ResourceName.dynamoDb.GEO_DATA_INDEX_COUNTRY_CODE;
/**
 * Function to retrieve city data from a DynamoDB table based on provided countryCode and stateCode.
 * 
 * The function supports two modes of operation:
 * 
 * 1. If `stateCode` is "*":
 *    - The function retrieves all cities within the specified `countryCode`.
 *    - This is useful for scenarios where all cities in a country are required without filtering by state.
 * 
 * 2. If `stateCode` is not "*":
 *    - The function retrieves cities within the specified `countryCode` and `stateCode`.
 *    - This mode is used when a more granular search is needed for cities within a specific state of a country. 
 * The function returns a JSON response containing:
 * - `cities`: An array of city objects matching the search criteria.
 */
export const handler: APIGatewayProxyHandler = async (event) => {
    const { countryCode, stateCode, language } = JSON.parse(event.body);
    try {
        const { Items } = await dynamoDb.send(new QueryCommand({
            TableName: citiesTable,
            IndexName: citiesTableIndex,
            KeyConditionExpression: "countryCode = :countryCode" + (stateCode !== '*' ? " AND stateCode = :stateCode" : ""),
            ExpressionAttributeValues: {
                ":countryCode": { S: countryCode },
                ...(stateCode !== '*' ? { ":stateCode": { S: stateCode } } : {})
            },
            ProjectionExpression: `geonameId, countryCode, stateCode, ${language}`,
        }));
        const cities = Items.map(item => unmarshall(item));
        return {
            statusCode: 200,
            body: JSON.stringify({ cities }),
        };
    } catch (error) {
        console.error('Error retrieving city data:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to retrieve city data' }),
        };
    }
};
