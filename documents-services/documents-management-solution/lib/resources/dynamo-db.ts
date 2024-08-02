import { AttributeType, BillingMode, ProjectionType, Table, TableClass, TableEncryption } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { RemovalPolicy } from "aws-cdk-lib";
import { isProduction } from "../../helpers/utilities";
import { ResourceName } from "../resource-reference";

/**
 * Creation and configuration of DynamoDB tables.
 * @param scope 
 */
export default function configureDynamoDbResources(scope: Construct ) {
    new Table(scope, ResourceName.dynamoDbTables.DOCUMENTS_METADATA, {
        tableName: ResourceName.dynamoDbTables.DOCUMENTS_METADATA,
        partitionKey: { name: "documentId", type: AttributeType.STRING },
        billingMode: BillingMode.PAY_PER_REQUEST,
        tableClass: TableClass.STANDARD,
        encryption: TableEncryption.DEFAULT,
        removalPolicy: isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });
    const documentsAuditTable = new Table(scope, ResourceName.dynamoDbTables.DOCUMENTS_AUDIT, {
        tableName: ResourceName.dynamoDbTables.DOCUMENTS_AUDIT,
        partitionKey: { name: "auditId", type: AttributeType.STRING },
        sortKey: { name: "documentId", type: AttributeType.STRING },
        billingMode: BillingMode.PAY_PER_REQUEST,
        tableClass: TableClass.STANDARD,
        encryption: TableEncryption.DEFAULT,
        removalPolicy: isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });
    documentsAuditTable.addGlobalSecondaryIndex({
        indexName: ResourceName.dynamoDbTables.DOCUMENTS_AUDIT_INDEX_EVENT_INITIATOR,
        partitionKey: { name: 'eventInitiator', type: AttributeType.STRING },
        sortKey: { name: 'documentId', type: AttributeType.STRING },
        projectionType: ProjectionType.ALL,
    });
    documentsAuditTable.addGlobalSecondaryIndex({
        indexName: ResourceName.dynamoDbTables.DOCUMENTS_AUDIT_INDEX_DOCUMENT_ID,
        partitionKey: { name: 'documentId', type: AttributeType.STRING },
        sortKey: { name: 'eventInitiator', type: AttributeType.STRING },
        projectionType: ProjectionType.ALL,
    });
}