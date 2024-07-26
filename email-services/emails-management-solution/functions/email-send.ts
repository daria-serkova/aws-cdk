import { APIGatewayProxyHandler } from "aws-lambda";
import { S3 } from 'aws-sdk';
const s3 = new S3({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.BUCKET_NAME!;
const BUCKET_TEMPLATES_LOCATION = process.env.BUCKET_TEMPLATES_LOCATION!;

export const handler: APIGatewayProxyHandler = async (event) => {
        const body = JSON.parse(event.body!);
        const { templateId, locale, recipient, emailData, initiatorSystemCode } = body;
        const s3Key = `${BUCKET_TEMPLATES_LOCATION}/${locale}/${templateId}.json`;
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
        const templateContent = templateObject?.Body?.toString('utf-8') || '';
        
        const template = JSON.parse(templateContent);


      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: 'Email successfully sent',
          templateId: templateId,
          locale: locale,
          recipient: recipient,
          template: template
        }),
      };
}