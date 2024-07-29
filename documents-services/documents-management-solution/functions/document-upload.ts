import { S3 } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';

const s3 = new S3({ region: process.env.REGION });
const BUCKET_NAME = process.env.BUCKET_NAME!;

export const handler: APIGatewayProxyHandler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ 
      message: 'Document uploaded successfully',
    }),
  };
};
