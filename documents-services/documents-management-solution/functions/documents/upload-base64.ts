import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { determineDocumentStatus, getContentTypeByFormat, getCurrentTime, uploadFolder } from '../helpers/utilities';
import { Buffer } from 'buffer';
import { EventCodes } from '../helpers/utilities';

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
  const { documentContent, documentOwnerId, documentCategory, documentFormat, documentNameSuffix } =  event.body;
  if (!documentContent) {
    return {
      statusCode: 400,
      body: {
        error: `Can't upload document. Required data elements are missing`
      }
    }
  }
  const buffer = Buffer.from(documentContent, 'base64');
  const uploadLocation = uploadFolder(documentOwnerId, documentCategory);
  const documentName = `${documentCategory}${documentNameSuffix ? `_${documentNameSuffix.toUpperCase().replace(/[\s\W]+/g, '_')}`: ""}`;
  const key = `${uploadLocation}/${documentName}.${documentFormat}`;
  let version: string;
  try {
    const uploadResult = await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: getContentTypeByFormat(documentFormat),
      Metadata: {
        documentOwnerId: documentOwnerId,
      },
    }));
    version = uploadResult.VersionId
    return {
      statusCode: 200,
      body: {
        documentId: key,
        version,
        documentName,
        ...(({
          documentContent,      // Exclude documentContent from passing further
          metadata,             // Exclude metadata object from passing further
          documentNameSuffix,   // Exclude document name suffix from passing further
          ...rest               // Pass rest of the properties
        }) => rest)(event.body),
        ...event.body.metadata,
        uploadedAt: getCurrentTime(),
        documentStatus: determineDocumentStatus(documentCategory),
        action: EventCodes.UPLOAD
      },
    } 
  } catch (error) {
    console.error('Error uploading document to S3:', error);
    return {
      statusCode: 500,
      body: {
        error: `Request could not be processed. ${error.message}`
      }
    }
  }
}