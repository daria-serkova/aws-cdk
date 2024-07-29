import { S3 } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { generateUUID, getContentTypeByFormat, uploadFolder } from './helpers/utilities';
import { Buffer } from 'buffer';

export interface UploadedDocument {
  documentOwnerId: string;
  documentName: string;
  documentFormat: string;
  documentSize: number;
  documentCategory: string;
  documentContent: string;
  metadata: object
}
const s3 = new S3({ region: process.env.REGION });
const BUCKET_NAME = process.env.BUCKET_NAME!;

/**
 * Lambda function handler for uploading a document to an S3 bucket.
 * The function processes a document object, which is expected to be passed in the event payload in the base64-encoded format.
 *
 * @param event - The input event containing the document object to be uploaded.
 * @returns - An object containing document metadata object
 * @throws - Throws an error if the upload fails, with the error message or 'Internal Server Error' as the default.
 */
 export const handler: APIGatewayProxyHandler = async (event) => {
    const document = JSON.parse(event.body || '{}') as UploadedDocument;
    const buffer = Buffer.from(document.documentContent, 'base64');
    const documentId = generateUUID();
    const uploadedAt = new Date().toISOString();
    const metadata = {
      ...document.metadata,
      documentId: documentId,
      uploadedAt: uploadedAt,
      documentOwnerId: document.documentOwnerId
    };
    const metadataEntries = Object.entries(metadata).reduce((acc: any, [key, value]) => {
      acc[key] = value.toString();
      return acc;
    }, {});
    const uploadLocation = uploadFolder(document.documentOwnerId, document.documentCategory);
    const key = `${uploadLocation}/${document.documentCategory}-${uploadedAt}.${document.documentFormat}`;
    await s3.upload({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: getContentTypeByFormat(document.documentFormat),
      Metadata: metadataEntries,
    }).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Document uploaded successfully',
        url: key
      })
    }
  }
        // const metadata = {
        //     id: documentId,
        //     providerId: document.providerId,
        //     type: document.category,
        //     url: `s3://${bucketName}/${key}`,
        //     documentNumber: document.metadata.documentNumber,
        //     issueDate: document.metadata.issueDate,
        //     expiryDate: document.metadata.expiryDate,
        //     issuedBy: document.metadata.issuedBy,
        //     verificationStatus: DocumentsStatuses.VERIFICATION.PENDING,
        //     uploadTimestamp: new Date().getTime().toString()
        // }
        