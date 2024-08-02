import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const client = new DynamoDBClient({ region: process.env.REGION });
const TABLE_NAME = process.env.TABLE_NAME!;
const INDEX_DOCUMENT_ID_NAME = process.env.INDEX_DOCUMENT_ID_NAME!;
const INDEX_USER_ID_NAME = process.env.INDEX_USER_ID_NAME!;

/**
 * Lambda function handler for retrieving list of audit events.
 *
 * @param event - The input event containing the objectId.
 * @returns - A list of items matching the objectId.
 * @throws - Throws an error if the query operation fails.
 */
export const handler = async (event: any): Promise<any> => {
  const body = JSON.parse(event.body!);
  const { documentId, userId, action } = body;
  if ((action === 'USER' && userId === '*') || (action === 'DOCUMENT' && documentId === '*')) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Unsupported operation requested. Please provide required data for the request',
      }),
    };
  }
  const params = action === 'DOCUMENT'
  ? {
      TableName: TABLE_NAME,
      IndexName: INDEX_DOCUMENT_ID_NAME,
      KeyConditionExpression: "documentId = :documentId" + (userId !== '*' ? " AND eventInitiator = :eventInitiator" : ""),
      ExpressionAttributeValues: {
          ":documentId": { S: documentId },
          ...(userId !== '*' ? { ":eventInitiator": { S: userId } } : {})
      }
  }
  : {
      TableName: TABLE_NAME,
      IndexName: INDEX_USER_ID_NAME,
      KeyConditionExpression: "eventInitiator = :eventInitiator" + (documentId !== '*' ? " AND documentId = :documentId" : ""),
      ExpressionAttributeValues: {
          ":eventInitiator": { S: userId },
          ...(documentId !== '*' ? { ":documentId": { S: documentId } } : {})
      }
  };
  try {
    const data = await client.send(new QueryCommand(params));
    const unmarshalledItems = data?.Items?.map(item => unmarshall(item));
    return  {
      statusCode: 200,
      body: JSON.stringify(unmarshalledItems),
    };
  } catch (error) {
    console.error('Error querying items from DynamoDB:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to retrieve items. Please try again later.',
        errors: error.message,
      }),
    };
  }
}
