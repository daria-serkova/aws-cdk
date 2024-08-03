import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { DocumentStatuses, generateUUID } from '../helpers/utilities';

const dynamoDb = new DynamoDBClient({ region: process.env.REGION });
const METADATA_TABLE_NAME = process.env.METADATA_TABLE_NAME!;
const VERIFICATION_TABLE_NAME = process.env.VERIFICATION_TABLE_NAME!;

/**
 * Lambda function handler for storing audit events in DynamoDB.
 *
 * @param event - The input event containing the document metadata.
 * @returns - A success message if the metadata is stored successfully.
 * @throws - Throws an error if the metadata storage fails.
 */
 export const handler = async (event: any): Promise<any> => {
  const { documentId, requestorId, verificationStatus, comment } =  event.body;
  if (!documentId) {
      return {
          statusCode: 400,
          body: {
              error: `Can't process request. Document Id is missing from event body`,
          }
      }
  }
  try {
      const getMetadataResult = await dynamoDb.send(
        new GetItemCommand({ TableName: METADATA_TABLE_NAME, Key: { documentId: { S: documentId }}
      }));
      if (!getMetadataResult.Item) 
        return {
          statusCode: 404,
          body: {
              error: `Can't process request. Document with Document Id was not found in the database`,
          }
      }
      const metadataRecord = unmarshall(getMetadataResult.Item);
      const isTransitionAllowed = validateStatusTransition(verificationStatus, metadataRecord.documentStatus);
      if (!isTransitionAllowed.isValid) {
        return {
          statusCode: 400,
          body: {
              error: `Transition can't be performed. ${isTransitionAllowed.errorDetails}`,
          }
        }
      }
      const saveVerificationRecord = await dynamoDb.send(new PutItemCommand({ 
          TableName: VERIFICATION_TABLE_NAME, 
          Item: marshall({
            verificationId: generateUUID(),
            documentId,
            verifierId: requestorId,
            verificationStatus,
            comment: getComment(verificationStatus, comment)

          })
      }));
      metadataRecord.documentStatus = verificationStatus;
      return {
        statusCode: 200,
        body: {
          ...metadataRecord,
          initiatorSystemCode: event.body.initiatorSystemCode,
          requestorId: event.body.requestorId,
          action: verificationStatus
        },
      }
  } catch (error) {
      console.error(`Request could not be processed`, error);
      return {
          statusCode: 500,
          body: {
             error: `Request could not be processed. ${error.message}`
          }
      }
  }
};

const validateStatusTransition = (newStatus: string, currentStatus: string): 
    { isValid: boolean; errorDetails?: string } => {
  const errorDetails: string[] = [];
  switch (newStatus) {
      case DocumentStatuses.UNDER_REVIEW:
          if (currentStatus !== DocumentStatuses.PENDING_REVIEW) {
              errorDetails.push(`Error: ${newStatus} can only be transitioned from ${DocumentStatuses.PENDING_REVIEW} status. Current status is '${currentStatus}'`);
          }
          break;
      case DocumentStatuses.VERIFIED:
      case DocumentStatuses.REJECTED:
          if (!DocumentStatuses.UNDER_REVIEW) {
              errorDetails.push(`Error: '${newStatus}' can only be transitioned from ${DocumentStatuses.UNDER_REVIEW} status. Current status is '${currentStatus}`);
          }
          break;
      default:
        errorDetails.push(`Error: 'Usupported transition '${newStatus}'`);
        break;
  }
  return {
      isValid: errorDetails.length === 0,
      errorDetails: errorDetails.join(" ")
  };
}
const getComment = (status: string, comment: string): string => {
  if (comment) return comment;
  switch (status) {
    case DocumentStatuses.UNDER_REVIEW:
      return 'Verification process has been started'
    case DocumentStatuses.VERIFIED:
      return 'Verification process has been completed. Document is verified. No additional details were provided by verifier'
    case DocumentStatuses.REJECTED:
      return 'Verification process has been completed. Document is rejected. No additional details were provided by verifier'
    default:
    return `Unsupported status: ${status}`
  }
}