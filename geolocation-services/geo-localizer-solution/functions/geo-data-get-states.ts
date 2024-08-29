import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { ResourceName } from '../lib/resource-reference';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { filterByLabel } from '../helpers/utilities';

const dynamoDb = new DynamoDBClient({ region: process.env.REGION });
const tableName = ResourceName.dynamoDb.GEO_DATA_STATES_TABLE;
const tableIndex = ResourceName.dynamoDb.GEO_DATA_INDEX_COUNTRY_CODE;

/**
 * AWS Lambda function that retrieves states data from a DynamoDB table.
 * 
 * @param event - The input event to the Lambda function, containing the request body with the `language` and `countryCode` parameters.
 * @returns The response object containing the status code and the JSON body with the results or error message.
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
            ProjectionExpression: `stateCode, ${language}`,
        });

        const result = await dynamoDb.send(queryCommand);
        const filteredItems = (result.Items || []).map(item => {
            const unmarshalledItem = unmarshall(item);
            return {
                value: unmarshalledItem.stateCode,
                label: unmarshalledItem[language],
            };
        }).filter(item => item.label !== undefined);
        return {
            statusCode: 200,
            body: JSON.stringify(filterByLabel(filteredItems)),
        };
    } catch (error) {
        console.error('Error retrieving states:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to retrieve states' }),
        };
    }
};
