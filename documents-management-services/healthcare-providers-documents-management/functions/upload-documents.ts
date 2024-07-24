import { S3 } from 'aws-sdk';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { Document } from './helpers/types';
import { Buffer } from 'buffer';
import { documentContentType, DocumentsStatuses, DocumentsStoragePaths } from './helpers/configs';
import { generateDocumentUUID } from './helpers/utils';

const s3 = new S3();
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
        const document: Document = event;
        const buffer = Buffer.from(document.content, 'base64');
        const bucketName = process.env.BUCKET_NAME || '';
        const documentId = generateDocumentUUID()
        const key = `${DocumentsStoragePaths.CREDENTIALS.SUBMITTED.replace('$', document.providerId)}/${document.category}-${document.providerId}-${documentId}.${document.type}`;
        const params = {
            Bucket: bucketName,
            Key: key,
            Body: buffer,
            ContentType: documentContentType(document.type),
        };
        await s3.upload(params).promise();
        const metadata = {
            id: generateDocumentUUID(),
            providerId: document.providerId,
            type: document.category,
            url: `s3://${bucketName}/${key}`,
            documentNumber: document.metadata.documentNumber,
            issueDate: document.metadata.issueDate,
            expiryDate: document.metadata.expiryDate,
            issuedBy: document.metadata.issuedBy,
            verificationStatus: DocumentsStatuses.VERIFICATION.PENDING,
            uploadTimestamp: new Date().getTime().toString()
        }
        await dynamoDbClient.send(new PutItemCommand({
            TableName: process.env.METADATA_TABLE || '',
            Item: marshall(metadata)
        }));
        return {
            statusCode: 200,
            metadata
        };
    } catch (error) {
        throw new Error((error as Error).message || 'Internal Server Error');
    }
};
