import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { marshall } from "@aws-sdk/util-dynamodb";
import { 
    determineDocumentStatus, 
    EventCodes, 
    getAuditEvent,
    resolveTableName } from "../../helpers/utilities";
import { sendEvent } from "../../helpers/audit";

const s3Client = new S3Client({ region: process.env.REGION });
const dynamoDb = new DynamoDBClient({ region: process.env.REGION });

const tableTypes = {
    metadata: 'metadata',
    audit: 'audit'
}

/**
 * Lambda function handler to process S3 events for file uploads.
 * 
 * This function is triggered by S3 events (file uploads inside /upload folders) and performs the following:
 * 1. Validation:
 *    - Ensures the event contains necessary S3 bucket and object details.
 * 
 * 2. Fetch Object Metadata:
 *    - Retrieves metadata of the uploaded file from the S3 bucket.
 *    - Handles cases where metadata is not found.
 * 
 * 3. Prepare Metadata Record:
 *    - Constructs a metadata record to be saved in DynamoDB.
 *    - Excludes certain metadata fields such as `uploadinitiatedbysystemcode` (used for audit).
 * 
 * 4. Save Metadata to DynamoDB:
 *    - Inserts the constructed metadata record into the DynamoDB table specified by `METADATA_TABLE_NAME`.
 * 
 * 5. Create and Save Audit Record:
 *    - Generates an audit event detailing the upload operation.
 *    - Saves the audit event to the DynamoDB table specified by `AUDIT_TABLE_NAME`.
 * 
 * 6. Error Handling:
 *    - Logs errors and returns appropriate HTTP status codes if issues occur during metadata retrieval, 
 *      metadata saving, or audit event saving.
 * 
 * @param event - The S3 event that triggered the Lambda function.
 * @returns An object containing HTTP status code and message.
 */
export const handler = async (event: any): Promise<any> => {
    const record = event.Records[0];
    if (!record?.s3?.bucket?.name || !record?.s3?.object?.key || !record?.s3?.object?.size
          || !record?.s3?.object?.versionId || !record?.eventTime || !record?.requestParameters?.sourceIPAddress) {
        console.error(`Missing S3 event details.`);
        return {
            statusCode: 400,
            body: JSON.stringify({ message: `Required S3 event details are missing.` }),
        };
    }
    
    const bucketName = record.s3.bucket.name;
    const documentId = record.s3.object.key;
    const documentSize = record.s3.object.size;
    const version = record.s3.object.versionId;
    const eventTime = new Date(record.eventTime).getTime().toString();
    const eventIp = record.requestParameters.sourceIPAddress;
    const documentType = documentId.split('/')[0];

    try {
        // Fetch object metadata from S3
        const headObject = await s3Client.send(new HeadObjectCommand({ Bucket: bucketName, Key: documentId }));
        const metadata = headObject.Metadata;
        if (!metadata) {
            console.error(`S3 object metadata not found.`);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: `S3 object metadata not found.` }),
            };
        }
        let table = resolveTableName(documentType, tableTypes.metadata);
        // Prepare metadata record for DynamoDB
        const metadataDbRecord = {
            documentid: documentId,
            documentsize: documentSize,
            documentstatus: determineDocumentStatus(metadata.documentcategory),
            version,
            ...(({
                documentsize,                 // Exclude from metadata
                uploadinitiatedbysystemcode,  // Exclude from metadata
                ...rest                       // Include the rest
            }) => rest)(metadata)
        };
        try {
            // Save metadata to DynamoDB
            await dynamoDb.send(new PutItemCommand({ TableName: table, Item: marshall(metadataDbRecord) }));
            // Create and save audit event
            const auditEvent = getAuditEvent(
                documentId, 
                version,
                EventCodes.UPLOAD, 
                eventTime, 
                metadata.uploadedby, 
                metadata.uploadinitiatedbysystemcode,
                eventIp
            );
            await sendEvent({});

        } catch (error) {
            console.error(`Failed to save data to DynamoDB`, error);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: `Failed to save record in DynamoDB. See logs for more details` }),
            };
        }
    } catch (error) {
        console.error(`Failed to retrieve data from S3`, error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: `Failed to retrieve data from S3.  See logs for more details` }),
        };
    }
};
