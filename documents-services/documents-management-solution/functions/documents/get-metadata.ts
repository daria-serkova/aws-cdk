import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { EventCodes, getDocumentTableNamePatternByType, resolveTableName } from "../helpers/utilities";

const dynamoDb = new DynamoDBClient({ region: process.env.REGION });
const tableType = 'metadata';
/**
 * Lambda handler function to retrieve document metadata from DynamoDB.
 * 
 * @param {any} event - The event object containing the request body.
 * @returns {Promise<any>} - The response object containing the document metadata + initial request information or an error message.
 */
 export const handler = async (event: any): Promise<any> => {
    if (event.statusCode && event.statusCode !== 200) return event; // skip step if previos returned non success
    const { documentid, documenttype } =  event.body;
    const actions = event.body.actions || [];
    actions.push(EventCodes.VIEW_METADATA);
    if (!documentid || !documenttype) {
        return {
            statusCode: 400,
            body: {
                error: `Can't retrieve document's url. Document ID or Document Type is not provided`
            }
        }
    }
    try {
        const table = resolveTableName(documenttype, tableType);
        const { Item } = await dynamoDb.send(
            new GetItemCommand({ TableName: table, Key: { documentid: { S: documentid } }})
        );
        return Item ? {
            statusCode: 200,
            body: {
                ...unmarshall(Item),
                ...event.body,
                actions
            }
        } : {
            statusCode: 404,
            body: {
               error: `Record with documentID ${documentid} is not found`
            }
        }
    } catch (error) {
        console.error(`Can't retrieve document's metadata from DynamoDB.`, error);
        return {
            statusCode: 500,
            body: {
               error: `Request could not be processed. See logs for more details.`
            }
        }
    }
}