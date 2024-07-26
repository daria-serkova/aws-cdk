import { S3, DynamoDB } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';

const s3 = new S3();
const dynamoDb = new DynamoDB.DocumentClient();

const BUCKET_NAME = process.env.BUCKET_NAME!;
const TABLE_NAME = process.env.TABLE_NAME!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body!);
    const { templateId, updatedAt, updatedBy, templateData } = body;
    console.log("EVENT: " + event)
    console.log("BODY: " + body)

    // Save template data to S3
    /*
    const s3Key = `templates/${templateId}.json`;
    await s3.putObject({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: templateData,
      ContentType: 'text/html',
    }).promise();
    */

    // Save update log to DynamoDB
    /*
    const logItem = {
      templateId,
      updatedAt,
      updatedBy,
      s3Key,
      logId: `${templateId}-${updatedAt}`, // Unique log ID
    };
    */
/*
    await dynamoDb.put({
      TableName: TABLE_NAME,
      Item: logItem,
    }).promise();
*/
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Template updated successfully' }),
    };
  } catch (error) {
    console.error('Error updating template:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to update template' }),
    };
  }
};
