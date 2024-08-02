import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { EventCodes, determineDocumentStatus, generateUUID, getAuditEvent, getContentTypeByFormat, uploadFolder } from './helpers/utilities';
import { Buffer } from 'buffer';
import { DocumentBase64 } from './helpers/types';

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
const s3Client = new S3Client({ region: process.env.REGION });
const BUCKET_NAME = process.env.BUCKET_NAME!;

/**
 * Lambda function handler for uploading a document to an S3 bucket.
 * The function processes a document object, which is expected to be passed in the event payload in the base64-encoded format.
 *
 * @param event - The input event containing the document object to be uploaded.
 * @returns - An object containing document metadata object
 * @throws - Throws an error if the upload fails, with the error message or 'Internal Server Error' as the default.
 */
export const handler = async (event: any): Promise<any> => {
  const document : DocumentBase64 = event?.body?.document;
  const buffer = Buffer.from(document.documentContent, 'base64');
  //const documentId = generateUUID();
  const uploadedAt = new Date().toISOString();
  const uploadLocation = uploadFolder(document.documentOwner.documentOwnerId, document.documentCategory);
  const key = `${uploadLocation}/${document.documentCategory}.${document.documentFormat}`;
  let version: string;
  try {
    const uploadResult = await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: getContentTypeByFormat(document.documentFormat),
      Metadata: {
        //documentId: documentId,
        documentOwnerId: document.documentOwner.documentOwnerId,
      },
    }));
    version = uploadResult.VersionId
  } catch (error) {
    console.error('Error uploading document to S3:', error);
    return {
      statusCode: 500,
      body: { 
        message: 'Failed to upload document. Please try again later.',
        errors: error.message
      }
    };
  }
  return {
    statusCode: 200,
    body: { 
      objectId: key,
      metadata: {
        documentId: key,
        documentOwnerId: document.documentOwner.documentOwnerId,
        documentCategory: document.documentCategory,
        uploadedAt,
        version,
        ...document.metadata,
        status: determineDocumentStatus(document.documentCategory),
      },
      audit: getAuditEvent(key, version, EventCodes.UPLOAD, uploadedAt, document.documentOwner.documentOwnerId, document.initiatorSystemCode)
    }
  }
}
