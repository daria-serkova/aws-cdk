import { S3Client, GetObjectCommand, ListObjectVersionsCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PreSignUrlsExpirationConfigs } from "../helpers/utilities";
import { EventCodes } from "../helpers/utilities";

const s3Client = new S3Client({ region: process.env.REGION });
const BUCKET_NAME = process.env.BUCKET_NAME!;

/**
 * Lambda handler function to generate document pre-signed URL from S3 for view.
 * 
 * @param {any} event - The event object containing the request body.
 * @returns {Promise<any>} - The response object containing the document's url with all data from previous step or an error message.
 */
export const handler = async (event: any): Promise<any> => {
   if (event.statusCode && event.statusCode !== 200) return event; // skip step if previos returned non success
   const { documentid } =  event.body;
   const actions = event.body.actions || [];
   actions.push(EventCodes.VIEW_CONTENT);
   if (!documentid) {
       return {
           statusCode: 400,
           body: {
              error: `Can't retrieve document's url. Document ID is not provided`
           }
       }
   }
   try {
      const versionsResponse = await s3Client.send(
        new ListObjectVersionsCommand({ Bucket: BUCKET_NAME, Prefix: documentid })
      );
      const latestVersion = versionsResponse.Versions && versionsResponse.Versions[0];
      if (!latestVersion) {
         return {
            statusCode: 404,
            body: {
               error: `Latest version of document with documentID ${documentid} is not found`
            }
         }
      }
      const url = await getSignedUrl(s3Client, 
         new GetObjectCommand({Bucket: BUCKET_NAME, Key: documentid }), 
         { expiresIn: PreSignUrlsExpirationConfigs.DOCUMENT_VIEW_EXPIRATION_DURATION }
      );
      return url ? 
         {
            statusCode: 200,
            body: {
               ...event.body,
               url,
               urlexpiresat: new Date(Date.now() + PreSignUrlsExpirationConfigs.DOCUMENT_VIEW_EXPIRATION_DURATION * 1000).getTime(),
               actions,
               version: latestVersion.VersionId
            }
         } : {
            statusCode: 404,
            body: {
               error: `Record with documentID ${documentid} is not found`
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