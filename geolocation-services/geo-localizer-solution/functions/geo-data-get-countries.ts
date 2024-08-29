import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { ResourceName } from '../lib/resource-reference';
import { APIGatewayProxyHandler } from 'aws-lambda';

const dynamoDb = new DynamoDBClient({ 
    region: process.env.REGION 
});
const table = ResourceName.dynamoDb.GEO_DATA_COUNTRIES_TABLE;

/**
 * AWS Lambda function that retrieves and processes country data from a DynamoDB table.
 * 
 * @param event - The input event to the Lambda function, containing the request body with the `language` parameter.
 * @returns The response object containing the status code and the JSON body with the results or error message.
 */
export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        const { language } = JSON.parse(event.body);
        const scanResult = await dynamoDb.send(new ScanCommand({
            TableName: table,
            ProjectionExpression: `geonameId, countryCode, ${language}`,
        }));
        const filteredItems = (scanResult.Items || []).map(item => {
            const unmarshalledItem = unmarshall(item);
            return {
                geonameId: unmarshalledItem.geonameId,
                countryCode: unmarshalledItem.countryCode,
                name: unmarshalledItem[language],
            };
        }).filter(item => item.name !== undefined);

        // Sort by the "name" values alphabetically
        filteredItems.sort((a, b) => {
            const valueA = a.name.toLowerCase();
            const valueB = b.name.toLowerCase();
            return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        });
        return {
            statusCode: 200,
            body: JSON.stringify(filteredItems),
        };
    } catch (error) {
        console.error('Error fetching data:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch data' }),
        };
    }
};
