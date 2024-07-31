import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { DocumentMetadata } from './helpers/types';

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
  const metadata: DocumentMetadata = event;
  try {
    await dynamoDb.send(new PutItemCommand({
      TableName: TABLE_NAME,
      Item: marshall(metadata)
    }));
  } catch (error) {
    console.error('Error uploading document metadata to DynamoDB:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Failed to upload document's metadata. Please try again later.` }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Document metadata uploaded successfully' })
  };
};
