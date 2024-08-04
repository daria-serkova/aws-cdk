import { AttributeType, BillingMode, ProjectionType, Table, TableClass, TableEncryption } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { RemovalPolicy } from "aws-cdk-lib";
import { isProduction } from "../../helpers/utilities";
import { auditTables, metadataTables, ResourceName } from "../resource-reference";

const defaultTablesSettings = {
    billingMode: BillingMode.PAY_PER_REQUEST,
    tableClass: TableClass.STANDARD,
    encryption: TableEncryption.DEFAULT,
    removalPolicy: isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
}

/**
 * Creation and configuration of DynamoDB tables.
 * @param scope 
 */
export default function configureDynamoDbResources(scope: Construct ) {
    /* Documents Metadata per document type (Insurance, Billing, Providers, etc)*/
    let tables = metadataTables();
    tables.forEach((tableName) => {
        const table = new Table(scope, tableName, {
            tableName,
            partitionKey: { name: "documentid", type: AttributeType.STRING },
            ...defaultTablesSettings
        });
        table.addGlobalSecondaryIndex({
            indexName: `${tableName}-by-status`,
            partitionKey: { name: 'documentstatus', type: AttributeType.STRING },
            sortKey: { name: "documentownerid", type: AttributeType.STRING },
            projectionType: ProjectionType.ALL,
        });

        table.addGlobalSecondaryIndex({
            indexName: `${tableName}-by-owner`,
            partitionKey: { name: 'documentownerid', type: AttributeType.STRING },
            projectionType: ProjectionType.ALL,
        });
    });
    tables = auditTables();
    tables.forEach((tableName) => {
        const table = new Table(scope, tableName, {
            tableName: tableName,
            partitionKey: { name: "auditId", type: AttributeType.STRING },
            ...defaultTablesSettings
        });
        table.addGlobalSecondaryIndex({
            indexName: `${tableName}-by-event-initiator-doc-id`,
            partitionKey: { name: 'eventInitiator', type: AttributeType.STRING },
            sortKey: { name: 'documentId', type: AttributeType.STRING },
            projectionType: ProjectionType.ALL,
        });
        table.addGlobalSecondaryIndex({
            indexName: `${tableName}-by-event-initiator-event-type`,
            partitionKey: { name: 'eventInitiator', type: AttributeType.STRING },
            sortKey: { name: 'event', type: AttributeType.STRING },
            projectionType: ProjectionType.ALL,
        });
        table.addGlobalSecondaryIndex({
            indexName:`${tableName}-by-doc-id`,
            partitionKey: { name: 'documentId', type: AttributeType.STRING },
            projectionType: ProjectionType.ALL,
        });
    });

     /* Documents Verification Trail */
    const documentsVerificationTable = new Table(scope, ResourceName.dynamoDbTables.DOCUMENTS_VERIFICATION, {
        tableName: ResourceName.dynamoDbTables.DOCUMENTS_VERIFICATION,
        partitionKey: { name: "verificationId", type: AttributeType.STRING },
        ...defaultTablesSettings
    });
    documentsVerificationTable.addGlobalSecondaryIndex({
        indexName: ResourceName.dynamoDbTables.DOCUMENTS_VERIFICATION_INDEX_DOCUMENT_ID,
        partitionKey: { name: 'documentId', type: AttributeType.STRING },
        sortKey: { name: "documentStatus", type: AttributeType.STRING },
        projectionType: ProjectionType.ALL,
    });
}