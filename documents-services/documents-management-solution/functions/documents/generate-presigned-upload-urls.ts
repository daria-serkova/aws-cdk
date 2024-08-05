import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getContentTypeByFormat, getCurrentTime, PreSignUrlsExpirationConfigs, uploadFolder } from "../helpers/utilities";

const s3Client = new S3Client({ region: process.env.REGION });
const BUCKET_NAME = process.env.BUCKET_NAME!;

interface DocumentMetadata {
   [key: string]: string | number | boolean;
}
interface DocumentFile {
   documentownerid: string;
   documentformat: string;
   documentsize: number;
   documentcategory: string;
   documenttype: string;
   documentidentifier?: string;
   metadata?: DocumentMetadata;
}
interface DocumentUploadRequest {
    initiatorsystemcode: string;
    requestorid: string;
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
      const uploadLocation = uploadFolder(file.documentcategory, file.documentownerid);
      const documentName = `${file.documentcategory}${file.documentidentifier 
            ? `_${file.documentidentifier.toUpperCase().replace(/[\s\W]+/g, '_')}`
            : ""}`;
      const key = `${uploadLocation}/${documentName}.${file.documentformat}`;
      const command = new PutObjectCommand({
         Bucket: BUCKET_NAME,
         Key: key,
         ContentType: getContentTypeByFormat(file.documentformat),
         Metadata: {
            documentOwnerId: file.documentownerid,
            uploadInitiatedBySystemCode: request.initiatorsystemcode,
            uploadedBy: request.requestorid,
            uploadedAt: getCurrentTime(),
            documentName,
            documentCategory: file.documentcategory,
            documentFormat: file.documentformat,
            documentType: file.documenttype,
            documentSize: file.documentsize.toString(),
            ...file.metadata
         },
      });
      try {
         const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: PreSignUrlsExpirationConfigs.DOCUMENT_UPLOAD_EXPIRATION_DURATION });
         documentUploadUrls.push({ 
            documentCategory: file.documentcategory, 
            uploadUrl: uploadUrl,
            documentId: key 
         });
      } catch (error) {
         console.error(`Failed to create presigned URL for ${key}:`, error);
         return {
            statusCode: 500,
            body: JSON.stringify({
               message: `Failed to create presigned URL for ${file.documentcategory}`,
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
