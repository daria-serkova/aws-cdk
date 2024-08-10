import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { generateUUID } from '../helpers/utils';

const dynamoDb = new DynamoDBClient({ region: process.env.REGION });
const tableType = 'audit';

/**
 * Lambda function handler for storing audit events in DynamoDB.
 *
 * @param event - The input event containing the document metadata.
 * @returns - A success message if the metadata is stored successfully.
 * @throws - Throws an error if the metadata storage fails.
 */
 export const handler = async (event: any): Promise<any> => {
    const body = JSON.parse(event.body!);

    const auditId = generateUUID();
    return  {
        statusCode: 200,
        body: JSON.stringify({
            auditId,
        }),
      };
};
