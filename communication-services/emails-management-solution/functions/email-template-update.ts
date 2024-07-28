import { S3 } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { generateEmailHtml } from './helpers/emails';

const s3 = new S3({ region: process.env.REGION });
const BUCKET_NAME = process.env.BUCKET_NAME!;
const BUCKET_TEMPLATES_LOCATION = process.env.BUCKET_TEMPLATES_LOCATION!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body!);
    const { templateId, templateType, locale, updatedBy, initiatorSystemCode, templateData } = body;
    const htmlTemlate = generateEmailHtml(templateType, templateData.subject, templateData.content, templateData.footerDetails);
    const s3HtmlKey = `${BUCKET_TEMPLATES_LOCATION}/${locale}/${templateId}.html`;
    await s3.putObject({
      Bucket: BUCKET_NAME,
      Key: s3HtmlKey,
      Body: htmlTemlate,
      ContentType: 'text/html',
      Metadata: {
        subject: templateData.subject,
        locale,
        updatedAt: new Date().getTime().toString(),
        updatedBy,
        initiatorSystemCode
      },
    }).promise();
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
