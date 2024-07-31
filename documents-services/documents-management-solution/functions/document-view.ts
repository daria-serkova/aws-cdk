import { S3 } from 'aws-sdk';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { AuditEventCodes, getAuditEvent, PreSignUrlsExpirationConfigs } from './helpers/utilities';

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
export const handler: APIGatewayProxyHandler = async (event) => {
  const { initiatorSystemCode, documentOwnerId, documentId } = JSON.parse(event.body || '{}');
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
    const documentKey = documentMetadata.url.replace(`s3://${BUCKET_NAME}/`, '');
    const url = s3.getSignedUrl('getObject', {
      Bucket: BUCKET_NAME,
      Key: documentKey,
      Expires: PreSignUrlsExpirationConfigs.DOCUMENT_VIEW,
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        url,
        audit: getAuditEvent(AuditEventCodes.VIEW, new Date().toISOString(), documentOwnerId, documentId)
      }),
    };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to generate URL. Please try again later.' }),
    };
  }
};
