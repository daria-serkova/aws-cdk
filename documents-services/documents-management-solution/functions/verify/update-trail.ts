import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { DocumentStatuses, generateUUID, getAuditEventCode, resolveTableName } from '../helpers/utilities';

const dynamoDb = new DynamoDBClient({ region: process.env.REGION });
const tableType = 'verification';
/**
 * Handler for processing document verification requests.
 *
 * @param event - The event object containing the request details.
 * @returns A promise resolving to the response object.
 */
export const handler = async (event: any): Promise<any> => {
  // Skip step if the previous step returned a non-success status code
  if (event.statusCode && event.statusCode !== 200) return event;

  const { documentid, requestorid, verificationstatus, comment, documentstatus, documenttype } = event.body;

  if (!documentid || !requestorid || !verificationstatus || !documentstatus || !documenttype) {
    return {
      statusCode: 400,
      body: {
        error: "Can't process request. Document Id is missing from event body",
      },
    };
  }

  const { isValid, errorDetails } = validateStatusTransition(verificationstatus, documentstatus);
  if (!isValid) {
    return {
      statusCode: 400,
      body: {
        error: `Transition can't be performed. ${errorDetails}`,
      },
    };
  }

  const table = resolveTableName(documenttype, tableType);

  try {
    await dynamoDb.send(new PutItemCommand({
      TableName: table,
      Item: marshall({
        verificationid: generateUUID(),
        documentid,
        verifierid: requestorid,
        verificationstatus,
        comment: getComment(verificationstatus, comment),
      }),
    }));
    const actions = [];
    actions.push(getAuditEventCode(verificationstatus));
    return {
      statusCode: 200,
      body: {
        ...(({ // Extract data to exclude
          verificationstatus,
          comment,
          ...rest // Include rest of the properties
        }) => rest)(event.body),
        documentstatus: verificationstatus,
        actions,
      },
    };
  } catch (error) {
    console.error("Request could not be processed", error);
    return {
      statusCode: 500,
      body: {
        error: `Request could not be processed. ${error.message}`,
      },
    };
  }
};


/**
 * Function to validate the status transition of a document. 
 * @param newStatus The new status to transition to
 * @param currentStatus The current status of the document
 * @returns An object containing a boolean 'isValid' indicating if the transition is valid
 * and an optional 'errorDetails' string describing the error if any
 */
const validateStatusTransition = (newStatus: string, currentStatus: string): { isValid: boolean; errorDetails?: string } => {
  if (newStatus === currentStatus) {
    return {
      isValid: false,
      errorDetails: `Error: attempt to update status to the same value as current document status [${currentStatus}]`
    };
  }
  // Valid transitions mapped using the values of DocumentStatuses
  const validTransitions: { [key: string]: string[] } = {
    [DocumentStatuses.UNDER_REVIEW]: [DocumentStatuses.PENDING_REVIEW],
    [DocumentStatuses.VERIFIED]: [DocumentStatuses.UNDER_REVIEW],
    [DocumentStatuses.REJECTED]: [DocumentStatuses.UNDER_REVIEW]
  };
  const allowedStatuses = validTransitions[newStatus];
  if (allowedStatuses && !allowedStatuses.includes(currentStatus)) {
    return {
      isValid: false,
      errorDetails: `Error: '${newStatus}' can only be transitioned from '${allowedStatuses.join(', ')}' status. Current status is '${currentStatus}'`
    };
  }
  if (!allowedStatuses) {
    return {
      isValid: false,
      errorDetails: `Error: Unsupported transition '${newStatus}'`
    };
  }
  return { isValid: true };
};
/**
 * Function returns a default comment based on the provided document status.
 * If a custom comment is provided, it returns the custom comment.
 * 
 * @param status - The current status of the document.
 * @param comment - The custom comment provided by the user.
 * @returns The appropriate comment based on the document status.
 */
 const getComment = (status: string, comment: string): string => {
  if (comment) return comment;
  const defaultComments: Record<string, string> = {
    [DocumentStatuses.UNDER_REVIEW]: 'Verification process has been started',
    [DocumentStatuses.VERIFIED]: 'Verification process has been completed. Document is verified. No additional details were provided by verifier',
    [DocumentStatuses.REJECTED]: 'Verification process has been completed. Document is rejected. No additional details were provided by verifier'
  };
  return defaultComments[status] ?? `Unsupported status: ${status}`;
};
