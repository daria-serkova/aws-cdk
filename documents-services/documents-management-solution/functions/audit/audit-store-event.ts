import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { getAuditEvent, getCurrentTime, resolveTableName } from '../helpers/utilities';

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
  if (event.statusCode && event.statusCode !== 200) return event; // skip step if previos returned non success
  const { documentid, version, requestorid, requestorip, initiatorsystemcode, documenttype } = event.body;
  if (!documentid || !version || !requestorid || !initiatorsystemcode || !documenttype || !requestorip) {
    return {
      statusCode: 400,
      body: {
        error: `Can't store audit event. Required data is not provided`,
        ...event.body
      }
    }
  }
  const actions = event.body.actions || [];
  try {
    const table = resolveTableName(documenttype, tableType);
    const auditEvents = [];
    for (let index = 0; index < actions.length; index++) {
      const action = actions[index];
      const auditEvent = getAuditEvent(documentid, version, action, getCurrentTime(), requestorid, initiatorsystemcode, requestorip);
      await dynamoDb.send(new PutItemCommand({TableName: table, Item: marshall(auditEvent)}));
      auditEvents.push({
        action,
        auditid: auditEvent.auditid
      })
    }
    return {
      statusCode: 200,
      body: {
        ...(({
          requestorid,          // Extract `requestorid` to exclude it from response
          requestorip,          // Extract `requestorip` to exclude it from response
          initiatorsystemcode,  // Extract `initiatorsystemcode` to exclude it from response
          actions,              // Extract `actions` to exclude it from response
          ...rest               // Include rest of the properties to response
        }) => rest)(event.body),
        auditEvents
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
