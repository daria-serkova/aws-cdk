import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PreSignUrlsExpirationConfigs } from "../helpers/utilities";

const s3Client = new S3Client({ region: process.env.REGION });
const BUCKET_NAME = process.env.BUCKET_NAME!;

/**
 * Lambda handler function to generate document pre-signed URL from S3.
 * 
 * @param {any} event - The event object containing the request body.
 * @returns {Promise<any>} - The response object containing the document's url or an error message.
 */
export const handler = async (event: any): Promise<any> => {
   const { documentId } =  event.body;
   if (!documentId) {
       return {
           statusCode: 400,
           body: {
              error: `Can't retrieve document's url. Document ID is not provided`
           }
       }
   }
   try {
      const url = await getSignedUrl(s3Client, 
         new GetObjectCommand({Bucket: BUCKET_NAME, Key: documentId}), 
         { expiresIn: PreSignUrlsExpirationConfigs.DOCUMENT_VIEW_EXPIRATION_DURATION });
      return url ? 
         {
            statusCode: 200,
            body: {
               ...event.body,
               url,
               urlExpiresAt: new Date(Date.now() + PreSignUrlsExpirationConfigs.DOCUMENT_VIEW_EXPIRATION_DURATION * 1000)
            }
         } : {
            statusCode: 404,
            body: {
               error: `Record with documentID ${documentId} is not found`
            }
         }
   } catch (error) {
      console.error(`Can't retrieve document from S3.`, error);
      return {
         statusCode: 500,
         body: {
            error: `Request could not be processed. ${error.message}`
         }
      }
   }
}