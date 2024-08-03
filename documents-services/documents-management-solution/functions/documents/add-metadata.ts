import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { formSuccessBody } from '../helpers/utilities';

const dynamoDb = new DynamoDBClient({ region: process.env.REGION });
const TABLE_NAME = process.env.TABLE_NAME!;

/**
 * Lambda function handler for storing document metadata in DynamoDB.
 *
 * @param event - The input event containing the document metadata.
 * @returns - A success message if the metadata is stored successfully.
 * @throws - Throws an error if the metadata storage fails.
 */
export const handler = async (event: any): Promise<any> => {
  if (event.statusCode && event.statusCode !== 200) return event;

  const { documentId } = event.body;
  if (!documentId) {
    return {
      statusCode: 400,
      body: {
        error: `Can't add metadata. Required data elements (documentId) are missing`,
      }
    }
  }
  try { 
    await dynamoDb.send(new PutItemCommand({ TableName: TABLE_NAME, Item: marshall({
      ...(({
        requestorId,         // Extract `requestorId` to exclude it from DynamoDB record
        initiatorSystemCode, // Extract `initiatorSystemCode` to exclude it from DynamoDB record
        action,              // Extract `action` to exclude it from DynamoDB record
        ...rest              // Include rest of the properties to DynamoDB record
      }) => rest)(event.body)}
    )}));
    const resultFields = [
      'requestorId', 
      'initiatorSystemCode', 
      'action', 
      'documentId', 
      'version', 
      'documentOwnerId'
    ];
    return {
      statusCode: 200,
      body: formSuccessBody(event.body, resultFields)
    } 
  } catch (error) {
    console.error('Error adding document metadata to DynamoDB:', error);
    return {
      statusCode: 500,
      body: {
        error: `Request could not be processed. ${error.message}`
      }
    }
  }
};
