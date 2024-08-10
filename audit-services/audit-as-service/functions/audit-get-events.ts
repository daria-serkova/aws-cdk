// import { DynamoDBClient, QueryCommand, QueryCommandInput } from '@aws-sdk/client-dynamodb';
// import { unmarshall } from '@aws-sdk/util-dynamodb';
// import { RequestOperations, resolveTableIndexName, resolveTableName } from '../helpers/utilities';
// import { ResourceName } from '../../lib/resource-reference';

// const client = new DynamoDBClient({ region: process.env.REGION });
// const tableType = 'audit';

// /**
//  * Lambda function handler for retrieving list of audit events.
//  *
//  * @param event - The input event containing documentId, userId and audit action.
//  * @returns - A list of items matching the objectId.
//  * @throws - Throws an error if the query operation fails.
//  */
// export const handler = async (event: any): Promise<any> => {
//   const body = JSON.parse(event.body!);
//   const { documenttype, operationtype, documentid, eventinitiator, eventaction} = body;
//   if ((operationtype === RequestOperations.USER && (!eventinitiator || eventinitiator === '*')) || 
//       (operationtype === RequestOperations.DOCUMENT && (!documentid || documentid === '*')) || 
//       !documenttype) {
//     return {
//       statusCode: 500,
//       body: JSON.stringify({
//         message: 'Unsupported operation requested. Please provide required data for the request',
//       }),
//     };
//   }
//   const table = resolveTableName(documenttype, tableType);
//   const indexDocumentIdAndInitiator = resolveTableIndexName(documenttype, tableType, ResourceName.dynamoDbTables.INDEX_NAMES_SUFFIXES.DOCUMENT_ID_AND_EVENT_INITIATOR);
//   const indexUserAndDocumentId = resolveTableIndexName(documenttype, tableType, ResourceName.dynamoDbTables.INDEX_NAMES_SUFFIXES.EVENT_INITIATOR_AND_DOC_ID);
//   let params: QueryCommandInput;
//   switch (operationtype) {
//     case RequestOperations.DOCUMENT:
//       params = {
//         TableName: table,
//         IndexName: indexDocumentIdAndInitiator,
//         KeyConditionExpression: "documentid = :documentid" + (eventinitiator !== '*' ? " AND eventinitiator = :eventinitiator" : ""),
//         ExpressionAttributeValues: {
//             ":documentid": { S: documentid },
//             ...(eventinitiator !== '*' ? { ":eventinitiator": { S: eventinitiator } } : {})
//         },
//         //FilterExpression: eventaction ? "event = :event" : '',
//       }
//       break;
//     case RequestOperations.USER:
//       params =  {
//         TableName: table,
//         IndexName: indexUserAndDocumentId,
//         KeyConditionExpression: "eventinitiator = :eventinitiator" + (documentid !== '*' ? " AND documentid = :documentid" : ""),
//         ExpressionAttributeValues: {
//             ":eventinitiator": { S: eventinitiator },
//             ...(documentid !== '*' ? { ":documentid": { S: documentid } } : {})
//         },
//         //FilterExpression: eventaction ? "event = :event" : '',
//       }
//       break;
//     default:
//       return {
//         statusCode: 500,
//         body: JSON.stringify({
//           message: 'Unsupported operation requested. Please provide required data for the request',
//         }),
//       };
//   }
//   try {
//     const data = await client.send(new QueryCommand(params));
//     const unmarshalledItems = data?.Items?.map(item => unmarshall(item));
//     return  {
//       statusCode: 200,
//       body: JSON.stringify(unmarshalledItems),
//     };
//   } catch (error) {
//     console.error('Error querying items from DynamoDB:', error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({
//         message: 'Failed to retrieve items. Please try again later.',
//         errors: error.message,
//       }),
//     };
//   }
// }
