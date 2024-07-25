import { S3 } from 'aws-sdk';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { AuditEventDocumentUpload, DocumentMetadata } from './helpers/types';
import { AuditEventTypes, UserTypes } from './helpers/configs';
import { generateAuditEventUUID } from './helpers/utils';

const dynamoDbClient = new DynamoDBClient({ region: process.env.REGION });
/**
 * Lambda function handler for uploading a document to an S3 bucket.
 * The function processes a document object, which is expected to be passed in the event payload in the base64-encoded format.
 *
 * @param event - The input event containing the document object to be uploaded.
 * @returns - An object containing document metadata object
 * @throws - Throws an error if the upload fails, with the error message or 'Internal Server Error' as the default.
 */
export const handler = async (event: any): Promise<any> => {
    try {
        const metadata: DocumentMetadata = event.metadata;
        console.log(event);
        
        const auditEvent: AuditEventDocumentUpload = {
          id: generateAuditEventUUID(),
          eventType: AuditEventTypes.DOCUMENT_UPLOAD,
          timestamp: new Date().getTime().toString(),
          actor: {
            userId: metadata.providerId,
            userType: UserTypes.HEALTHCARE_PROVIDER
          },
          sourceIP: 'TEST',
          device: {
            deviceType: 'TEST',
            deviceModel: 'TEST',
            deviceVendor: 'TEST',
            osName: 'TEST',
            osVersion: 'TEST',
            browserName: 'TEST',
            browserVersion: 'TEST',
          },
          actionDetails: metadata
        }
        await dynamoDbClient.send(new PutItemCommand({
            TableName: process.env.AUDIT_TABLE || '',
            Item: marshall(auditEvent)
        }));
        return {
            
        };
    } catch (error) {
        throw new Error((error as Error).message || 'Internal Server Error');
    }
};
