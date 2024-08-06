import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { resolveTableName } from '../helpers/utilities';

const dynamoDb = new DynamoDBClient({ region: process.env.REGION });
const tableType = 'metadata';

/**
 * Lambda function handler for storing document metadata in DynamoDB.
 *
 * @param event - The input event containing the document metadata.
 * @returns - A success message if the metadata is stored successfully.
 * @throws - Throws an error if the metadata storage fails.
 */
export const handler = async (event: any): Promise<any> => {
  // Skip processing if previous step returned a non-success status code
  if (event.statusCode && event.statusCode !== 200) return event;
  const { documentid, documenttype, ...rest } = event.body;
  if (!documentid || !documenttype) {
    return {
      statusCode: 400,
      body: {
        error: "Can't add metadata. Required data elements (documentId) are missing",
      },
    };
  }
  const table = resolveTableName(documenttype, tableType);
  try {
    const { requestorip, requestorid, initiatorsystemcode, actions, ...item } = rest; // exclude from metadata record
    item.documentid = documentid;
    await dynamoDb.send(new PutItemCommand({ TableName: table, Item: marshall(item) }));
    return {
      statusCode: 200,
      body: { ...event.body },
    };
  } catch (error) {
    console.error('Error adding document metadata to DynamoDB:', error);
    return {
      statusCode: 500,
      body: {
        error: `Request could not be processed. ${error.message}`,
      },
    };
  }
};
