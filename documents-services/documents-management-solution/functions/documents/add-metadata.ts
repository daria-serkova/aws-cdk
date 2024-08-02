import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { DocumentMetadata } from '../helpers/types';
import { determineDocumentStatus } from '../helpers/utilities';

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
  const { documentId, documentCategory, requestorId,initiatorSystemCode  } =  event.body;
  if (!documentId || !documentCategory) {
    return {
      statusCode: 400,
      body: {
        error: `Can't add metadata. Required data elements are missing`
      }
    }
  }
  try {
    const metadata = {
      ...(({
        requestorId,         // Extract `requestorId` to exclude it
        initiatorSystemCode, // Extract `initiatorSystemCode` to exclude it
        ...rest              // Rest of the properties
      }) => rest)(event.body),
      documentStatus: determineDocumentStatus(documentCategory) // Add additional properties
    };
    
    await dynamoDb.send(new PutItemCommand({ TableName: TABLE_NAME, Item: marshall(metadata) }));
    return {
      statusCode: 200,
      body: {
        ...metadata,
        requestorId,
        initiatorSystemCode
      }
    };
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
