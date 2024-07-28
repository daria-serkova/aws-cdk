import { APIGatewayProxyHandler } from "aws-lambda";
import { S3 } from 'aws-sdk';
import { renderStaticStringWithDynamicData, sendEmail } from "./helpers/emails";
const s3 = new S3({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.BUCKET_NAME!;
const BUCKET_TEMPLATES_LOCATION = process.env.BUCKET_TEMPLATES_LOCATION!;
const BUCKET_LOGS_LOCATION = process.env.BUCKET_LOGS_LOCATION!;

export const handler: APIGatewayProxyHandler = async (event) => {
  const body = JSON.parse(event.body!);
  const { templateId, locale, recipient, emailData, initiatorSystemCode } = body;
  let s3Key = `${BUCKET_TEMPLATES_LOCATION}/${locale}/${templateId}.html`;
  let templateObject: S3.Types.GetObjectOutput;
  try {
    templateObject = await s3.getObject({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    }).promise();
  } catch (error) {
    console.error('Error retrieving email template:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Template ID ${templateId} is not supported` })
    };
  }
  const templateContent = templateObject?.Body?.toString('utf8') || '';
  const templateSubject = renderStaticStringWithDynamicData(templateObject?.Metadata?.subject || '', emailData);
  const emailContentWithDynamicData = renderStaticStringWithDynamicData(templateContent, emailData);
  await sendEmail(recipient, templateSubject, emailContentWithDynamicData);
  s3Key = `${BUCKET_LOGS_LOCATION}/${recipient}/${new Date().getTime()}-${templateId}.html`;
  await s3.putObject({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    Body: emailContentWithDynamicData,
    ContentType: 'text/html',
    Metadata: {
      subject: templateSubject,
      locale,
      sentAt: new Date().getTime().toString(),
      recipient,
      initiatorSystemCode
    },
  }).promise();
  return {
    statusCode: 200,
    body: JSON.stringify({ 
      message: 'Email successfully sent',
      templateId,
      locale,
      recipient,
      subject: templateSubject
    })
  };
}