import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const client = new DynamoDBClient({ region: process.env.REGION });
const TABLE_NAME = process.env.TABLE_NAME!;
const INDEX = process.env.INDEX!;

/**
 * Lambda function handler for retrieving list of documents
 *
 * @param event - The input event containing documentId, userId and audit action.
 * @returns - A list of items matching the objectId.
 * @throws - Throws an error if the query operation fails.
 */
export const handler = async (event: any): Promise<any> => {
  const body = JSON.parse(event.body!);
  const { documentStatus, documentOwnerId } = body;
  if (!documentStatus || !documentOwnerId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `Operation can't be completed. Please provide required data for the request`,
      }),
    };
  }
  const params = {
      TableName: TABLE_NAME,
      IndexName: INDEX,
      KeyConditionExpression: "documentStatus = :documentStatus" + (documentOwnerId !== '*' ? " AND documentOwnerId = :documentOwnerId" : ""),
      ExpressionAttributeValues: {
          ":documentStatus": { S: documentStatus },
          ...(documentOwnerId !== '*' ? { ":documentOwnerId": { S: documentOwnerId } } : {})
      },
      ProjectionExpression: "documentId, documentOwnerId, documentCategory, documentStatus"
  }
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
