import { S3 } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { generateUUID } from './helpers/utilities';

const s3 = new S3({ region: process.env.REGION });
const dynamoDbClient = new DynamoDBClient({ region: process.env.REGION });
const BUCKET_NAME = process.env.BUCKET_NAME!;
const BUCKET_TEMPLATES_LOCATION = process.env.BUCKET_TEMPLATES_LOCATION!;
const TABLE_NAME = process.env.TABLE_NAME!;
const BUCKET_TEMPLATES_URL_PREFIX = process.env.BUCKET_TEMPLATES_URL_PREFIX!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body!);
    const { templateId, updatedBy, templateData } = body;
    const s3Key = `${BUCKET_TEMPLATES_LOCATION}/${templateData.locale}/${templateId}.json`;
    const s3UrlPath = `${BUCKET_TEMPLATES_URL_PREFIX}/${templateData.locale}/${templateId}.json`;
    // Save file
    await s3.putObject({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: JSON.stringify(templateData),
      ContentType: 'application/json',
    }).promise();
    // Save change history
    await dynamoDbClient.send(new PutItemCommand({
      TableName: TABLE_NAME || '',
      Item: marshall({
        changeId: generateUUID(),
        templateId,
        updatedAt: new Date().getTime().toString(),
        updatedBy,
        template: s3UrlPath
      })
    }));
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Email template updated successfully',
        templateId: templateId
      }),
    };
  } catch (error) {
    console.error('Error updating template:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to update template' }),
    };
  }
};
