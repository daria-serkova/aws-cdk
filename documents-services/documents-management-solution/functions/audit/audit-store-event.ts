import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { AuditEvent } from '../helpers/types';

const dynamoDb = new DynamoDBClient({ region: process.env.REGION });
const TABLE_NAME = process.env.TABLE_NAME!;

/**
 * Lambda function handler for storing audit events in DynamoDB.
 *
 * @param event - The input event containing the document metadata.
 * @returns - A success message if the metadata is stored successfully.
 * @throws - Throws an error if the metadata storage fails.
 */
 export const handler = async (event: any): Promise<any> => {
  const auditEvent: AuditEvent = event.body?.audit;
  const objectId: string = event?.body?. objectId;
  
  try {
    await dynamoDb.send(new PutItemCommand({
      TableName: TABLE_NAME,
      Item: marshall(auditEvent)
    }));
    return {
      statusCode: 200,
      body: {
        objectId
      }
    }
  } catch (error) {
    console.error('Error saving audit event to DynamoDB:', error);
    return {
      statusCode: 500,
      body: { 
        message: `Failed to save audit event. Please try again later.`,
        errors: `${error.message}`
      },
    };
  }
  
};
