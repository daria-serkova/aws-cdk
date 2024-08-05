import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { getDocumentTableNamePatternByType } from '../helpers/utilities';
import { ResourceName } from '../../lib/resource-reference';

const client = new DynamoDBClient({ region: process.env.REGION });

/**
 * Lambda function handler for retrieving list of documents
 *
 * @param event
 */
export const handler = async (event: any): Promise<any> => {
  const body = JSON.parse(event.body!);
  const { documentOwnerId, documentType } = body;
  if (!documentOwnerId || !documentType) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `Operation can't be completed. Please provide required data for the request`,
      }),
    };
  }
  const metadataTable = `${getDocumentTableNamePatternByType(documentType)}`.replace('$', 'metadata');
  const metadataTableIndex = `${getDocumentTableNamePatternByType(documentType)}-${ResourceName.dynamoDbTables.INDEX_NAMES_SUFFIXES.OWNER}`.replace('$', 'metadata');
  const params = {
      TableName: metadataTable,
      IndexName: metadataTableIndex,
      KeyConditionExpression: "documentownerid = :documentownerid",
      ExpressionAttributeValues: {
          ":documentownerid": { S: documentOwnerId }
      },
      ProjectionExpression: "documentid, documentownerid, documentcategory, documentstatus, expirydate"
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
