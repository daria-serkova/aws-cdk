import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getContentTypeByFormat, getCurrentTime, PreSignUrlsExpirationConfigs, uploadFolder } from "../helpers/utilities";

const s3Client = new S3Client({ region: process.env.REGION });
const BUCKET_NAME = process.env.BUCKET_NAME!;

interface DocumentMetadata {
   [key: string]: string | number | boolean;
}
interface DocumentFile {
   documentOwnerId: string;
   documentFormat: string;
   documentSize: number;
   documentCategory: string;
   documentType: string;
   documentIdentifier?: string;
   metadata?: DocumentMetadata;
}
interface DocumentUploadRequest {
    initiatorSystemCode: string;
    requestorId: string;
    files: DocumentFile[];
}

/**
 * Lambda handler function to generate document pre-signed URLs for upload to S3.
 * 
 * @param {any} event - The event object containing the request body of DocumentUploadRequest format .
 * @returns {Promise<any>} - The response object containing the document's url or an error message.
 */
export const handler = async (event: any): Promise<any> => {
    const request: DocumentUploadRequest = JSON.parse(event.body);
    const documentUploadUrls: { 
       documentCategory: string, 
       uploadUrl: string,
       documentId: string
   }[] = [];
    for (const file of request.files) {
      const uploadLocation = uploadFolder(file.documentType, file.documentOwnerId);
      const documentName = `${file.documentCategory}${file.documentIdentifier 
            ? `_${file.documentIdentifier.toUpperCase().replace(/[\s\W]+/g, '_')}`
            : ""}`;
      const key = `${uploadLocation}/${documentName}.${file.documentFormat}`;
      const metadata =  file.metadata 
         ? Buffer.from(JSON.stringify(file.metadata)).toString('base64')
         : '';
      if (metadata.length > 2048) {
        return {
          statusCode: 500,
          body: JSON.stringify({ message: 'Encoded metadata exceeds the S3 metadata size limit.' }),
        };
      }
      const command = new PutObjectCommand({
         Bucket: BUCKET_NAME,
         Key: key,
         ContentType: getContentTypeByFormat(file.documentFormat),
         Metadata: {
            documentOwnerId: file.documentOwnerId,
            uploadInitiatedBySystemCode: request.initiatorSystemCode,
            uploadedBy: request.requestorId,
            uploadedAt: getCurrentTime(),
            documentName,
            documentCategory: file.documentCategory,
            documentFormat: file.documentFormat,
            documentType: file.documentType,
            documentSize: file.documentSize.toString(),
            metadata: metadata
         },
      });
      try {
         const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: PreSignUrlsExpirationConfigs.DOCUMENT_UPLOAD_EXPIRATION_DURATION });
         documentUploadUrls.push({ 
            documentCategory: file.documentCategory, 
            uploadUrl: uploadUrl,
            documentId: key 
         });
      } catch (error) {
         console.error(`Failed to create presigned URL for ${key}:`, error);
         return {
            statusCode: 500,
            body: JSON.stringify({
               message: `Failed to create presigned URL for ${file.documentCategory}`,
               error: error.message
            }),
         };
      }
    }
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Presigned URLs generated successfully',
            documentUploadUrls: documentUploadUrls,
        }),
    };
};
