import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { formatAuditEvent, generateUUID, getDatabaseDetails, getTtlValue } from '../helpers/utils';
import { ResourceName } from '../lib/resource-reference';

const dynamoDb = new DynamoDBClient({ region: process.env.REGION });
const tableType = 'audit';

/**
 * Lambda function handler for storing audit events in DynamoDB.
 *
 * @param event - The input event containing the document metadata.
 * @returns - A success message if the metadata is stored successfully.
 * @throws - Throws an error if the metadata storage fails.
 */
 export const handler = async (event: any): Promise<any> => {
    const body = JSON.parse(event.body!);
    const { eventtype, timestamp, requestorip, requestorid, initiatorsystemcode, ...rest } = body;
    const tableName = getDatabaseDetails(eventtype)?.tableName;
    if (!tableName) {
        return  {
            statusCode: 400,
            body: JSON.stringify({
                message: `Operation can't be completed. Event type (${eventtype}) is not supported.`,
            }),
          };
    }
    const eventid = generateUUID();
    const eventMetadata = formatAuditEvent(rest);
    const auditRecord = {
        eventid: eventid,
        timestamp,
        eventtype,
        requestorid,
        requestorip,
        initiatorsystemcode,
        requestordevice: eventMetadata.deviceDetails,
        requestdetails: eventMetadata.otherDetails,
        ttl: getTtlValue(timestamp)
    }
    try {
        await dynamoDb.send(new PutItemCommand({TableName: tableName, Item: marshall(auditRecord)}));
        return {
            statusCode: 200,
            body: JSON.stringify({
                eventid
            }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: `Operation can't be completed. Error: ${error}`
            }),
        };
    }
};
