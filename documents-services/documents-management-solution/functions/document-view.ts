import { S3 } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';

const s3 = new S3({ region: process.env.REGION });
const BUCKET_NAME = process.env.BUCKET_NAME!;

/**
 * Lambda function handler for generating a presigned URL for an S3 object.
 *
 * @param event - The input event containing the S3 object key.
 * @returns - The presigned URL for the S3 object.
 * @throws - Throws an error if the URL generation fails.
 */
export const handler: APIGatewayProxyHandler = async (event) => {
  const { key } = event.queryStringParameters || {};

  if (!key) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing "key" query parameter.' }),
    };
  }

  try {
    const url = s3.getSignedUrl('getObject', {
      Bucket: BUCKET_NAME,
      Key: key,
      Expires: 60 * 60, // URL expiration time in seconds (e.g., 1 hour)
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url }),
    };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to generate URL. Please try again later.' }),
    };
  }
};
