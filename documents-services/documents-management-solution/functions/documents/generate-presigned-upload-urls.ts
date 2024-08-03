import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getContentTypeByFormat, PreSignUrlsExpirationConfigs, uploadFolder } from "../helpers/utilities";

const s3Client = new S3Client({ region: process.env.REGION });
const BUCKET_NAME = process.env.BUCKET_NAME!;

interface DocumentFile {
    documentFormat: string;
    documentSize: number;
    documentCategory: string;
    documentIdentifier?: string;
}
interface DocumentUploadRequest {
    initiatorSystemCode: string;
    requestorId: string;
    documentOwnerId: string;
    files: DocumentFile[];
}

/**
 * Lambda handler function to generate document pre-signed URLs for upload to S3.
 * 
 * @param {any} event - The event object containing the request body.
 * @returns {Promise<any>} - The response object containing the document's url or an error message.
 */
export const handler = async (event: any): Promise<any> => {
    const request: DocumentUploadRequest = JSON.parse(event.body);
    const documentUploadUrls: { documentCategory: string, uploadUrl: string }[] = [];
    for (const file of request.files) {
      const uploadLocation = uploadFolder(request.documentOwnerId);
      const documentName = `${file.documentCategory}${file.documentIdentifier 
            ? `_${file.documentIdentifier.toUpperCase().replace(/[\s\W]+/g, '_')}`
            : ""}`;
      const key = `${uploadLocation}/${documentName}.${file.documentFormat}`;
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            ContentType: getContentTypeByFormat(file.documentFormat)
        });
        
        try {
            const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: PreSignUrlsExpirationConfigs.DOCUMENT_UPLOAD_EXPIRATION_DURATION });
            documentUploadUrls.push({
               documentCategory: file.documentCategory,
               uploadUrl: uploadUrl
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
