import { S3 } from 'aws-sdk';
import { EventCodes, determineDocumentStatus, generateUUID, getAuditEvent, getContentTypeByFormat, uploadFolder } from './helpers/utilities';
import { Buffer } from 'buffer';
import { DocumentMetadata } from './helpers/types';
import { getDocumentUploadNotifications } from './helpers/notifications';

export interface UploadedDocument {
  initiatorSystemCode: string;
  documentOwner: {
    documentOwnerId: string;
    documentOwnerEmail: string;
    documentOwnerName: string;
  };
  documentName: string;
  documentFormat: string;
  documentSize: number;
  documentCategory: string;
  documentContent: string;
  metadata: object
}

const s3 = new S3({ region: process.env.REGION });
const BUCKET_NAME = process.env.BUCKET_NAME!;
const UPLOAD_NOTIFICATION_RECIPIENT = process.env.UPLOAD_NOTIFICATION_RECIPIENT!;

/**
 * Lambda function handler for uploading a document to an S3 bucket.
 * The function processes a document object, which is expected to be passed in the event payload in the base64-encoded format.
 *
 * @param event - The input event containing the document object to be uploaded.
 * @returns - An object containing document metadata object
 * @throws - Throws an error if the upload fails, with the error message or 'Internal Server Error' as the default.
 */
export const handler = async (event: any): Promise<any> => {
  const document: UploadedDocument = event;
  const buffer = Buffer.from(document.documentContent, 'base64');
  const documentId = generateUUID();
  const uploadedAt = new Date().toISOString();
  const uploadLocation = uploadFolder(document.documentOwner.documentOwnerId, document.documentCategory);
  const key = `${uploadLocation}/${document.documentCategory}-${uploadedAt}.${document.documentFormat}`;
  try {
    await s3.upload({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: getContentTypeByFormat(document.documentFormat),
      Metadata: {
        documentId,
        documentOwnerId: document.documentOwner.documentOwnerId,
      },
    }).promise();
  } catch (error) {
    console.error('Error uploading document to S3:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to upload document. Please try again later.' }),
    };
  }
  const metadata: DocumentMetadata = {
    documentId: documentId,
    documentOwnerId: document.documentOwner.documentOwnerId,
    documentCategory: document.documentCategory,
    uploadedAt: uploadedAt,
    key: `s3://${BUCKET_NAME}/${key}`,
    ...document.metadata,
    status: determineDocumentStatus(document.documentCategory),
  };
  return {
    statusCode: 200,
    body: { 
      documentId,
      metadata,
      audit: getAuditEvent(
        documentId, 
        EventCodes.UPLOAD, 
        uploadedAt, 
        document.documentOwner.documentOwnerId, 
        document.initiatorSystemCode),
      notifications: getDocumentUploadNotifications(
        document.documentOwner.documentOwnerEmail,
        document.documentOwner.documentOwnerName, 
        document.initiatorSystemCode,
        metadata,
        UPLOAD_NOTIFICATION_RECIPIENT)
    }
  }
}