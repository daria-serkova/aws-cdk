import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const dynamoDb = new DynamoDBClient({ region: process.env.REGION });
const TABLE_NAME = process.env.TABLE_NAME!;
/**
 * Lambda handler function to retrieve document metadata from DynamoDB.
 * 
 * @param {any} event - The event object containing the request body.
 * @returns {Promise<any>} - The response object containing the document metadata or an error message.
 */
 export const handler = async (event: any): Promise<any> => {
    if (event.statusCode && event.statusCode !== 200) return event;
    
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
        const { Item } = await dynamoDb.send(new GetItemCommand({
            TableName: TABLE_NAME,
            Key: {
                documentId: { S: documentId },
            }
        }));
        return Item ? {
            statusCode: 200,
            body: {
                ...event.body,
                ...unmarshall(Item)
            }
        } : {
            statusCode: 404,
            body: {
               error: `Record with documentID ${documentId} is not found`
            }
        }
    } catch (error) {
        console.error(`Can't retrieve document's metadata from DynamoDB.`, error);
        return {
            statusCode: 500,
            body: {
               error: `Request could not be processed. ${error.message}`
            }
        }
    }
}