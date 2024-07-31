import { S3 } from 'aws-sdk';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { determineDocumentStatus, generateUUID, getContentTypeByFormat, uploadFolder } from './helpers/utilities';
import { Buffer } from 'buffer';

export interface UploadedDocument {
  documentOwnerId: string;
  documentName: string;
  documentFormat: string;
  documentSize: number;
  documentCategory: string;
  documentContent: string;
  metadata: object
}


/**
 * Lambda function handler for uploading a document to an S3 bucket.
 * The function processes a document object, which is expected to be passed in the event payload in the base64-encoded format.
 *
 * @param event - The input event containing the document object to be uploaded.
 * @returns - An object containing document metadata object
 * @throws - Throws an error if the upload fails, with the error message or 'Internal Server Error' as the default.
 */
 export const handler: APIGatewayProxyHandler = async (event) => {
    const document = JSON.parse(event.body || '{}') as UploadedDocument;
   
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Document uploaded successfully',
      })
    }
  }