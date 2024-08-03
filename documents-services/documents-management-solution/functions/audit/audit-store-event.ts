import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { getAuditEvent, getCurrentTime } from '../helpers/utilities';

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
  if (event.statusCode && event.statusCode !== 200) return event;
  //const { action } = event;
  const { action, documentId, version, documentOwnerId, requestorId, initiatorSystemCode } = event.body;
  if (!action || !documentId || !version || !documentOwnerId || !requestorId || !initiatorSystemCode) {
    return {
      statusCode: 400,
      body: {
        error: `Can't store audit event. Required data is not provided`,
      }
    }
  }
  const auditEvent = getAuditEvent(documentId, version, documentOwnerId, action, 
      getCurrentTime(), requestorId, initiatorSystemCode);
  try {
    await dynamoDb.send(new PutItemCommand({TableName: TABLE_NAME, Item: marshall(auditEvent)}));
    return {
      statusCode: 200,
      body: {
        ...event.body,
        auditEvent: auditEvent.auditId
      }
    }
  } catch (error) {
    console.error('Error saving audit event to DynamoDB:', error);
    return {
      statusCode: 500,
      body: {
         error: `Request could not be processed. ${error.message}`
      }
    }
  }
};
