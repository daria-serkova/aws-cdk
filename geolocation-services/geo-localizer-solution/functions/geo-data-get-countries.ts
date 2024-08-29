import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { ResourceName } from '../lib/resource-reference';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { filterByName } from '../helpers/utilities';

const dynamoDb = new DynamoDBClient({ 
    region: process.env.REGION 
});
const table = ResourceName.dynamoDb.GEO_DATA_COUNTRIES_TABLE;

/**
 * AWS Lambda function that retrieves country data from a DynamoDB table.
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
        return {
            statusCode: 200,
            body: JSON.stringify(filterByName(filteredItems)),
        };
    } catch (error) {
        console.error('Error fetching data:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch data' }),
        };
    }
};
