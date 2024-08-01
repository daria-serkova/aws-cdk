import { S3 } from 'aws-sdk';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { EventCodes, getAuditEvent, getCurrentTime, PreSignUrlsExpirationConfigs } from './helpers/utilities';

const s3 = new S3({ region: process.env.REGION });
const dynamoDb = new DynamoDBClient({ region: process.env.REGION });
const BUCKET_NAME = process.env.BUCKET_NAME!;
const TABLE_NAME = process.env.TABLE_NAME!;
/**
 * Lambda function handler for generating a presigned URL for an S3 object.
 *
 * @param event - The input event containing the request body.
 * @returns - The presigned URL for the S3 object.
 * @throws - Throws an error if the URL generation fails.
 */
 export const handler = async (event: any): Promise<any> => {
  const { initiatorSystemCode, documentOwnerId, documentId } = event;
  try {
    const { Item } = await dynamoDb.send(new GetItemCommand({
      TableName: TABLE_NAME,
      Key: {
        documentId: { S: documentId },
        documentOwnerId: { S: documentOwnerId }
      }
    }));
    if (!Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Document not found.' }),
      };
    }
    const documentMetadata = unmarshall(Item);
    const documentKey = documentMetadata.key.replace(`s3://${BUCKET_NAME}/`, '');
    const url = s3.getSignedUrl('getObject', {
      Bucket: BUCKET_NAME,
      Key: documentKey,
      Expires: PreSignUrlsExpirationConfigs.DOCUMENT_VIEW,
    });
    return {
      statusCode: 200,
      url,
      audit: getAuditEvent(documentId, EventCodes.VIEW, getCurrentTime(), documentOwnerId, initiatorSystemCode)
    };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to generate URL. Please try again later.' }),
    };
  }
};
