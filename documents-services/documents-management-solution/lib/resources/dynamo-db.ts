import { AttributeType, BillingMode, ProjectionType, Table, TableClass, TableEncryption } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { RemovalPolicy } from "aws-cdk-lib";
import { isProduction } from "../../helpers/utilities";
import { auditTables, metadataTables, ResourceName, verificationTables } from "../resource-reference";
import { table } from "console";

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
            indexName: `${tableName}-${ResourceName.dynamoDbTables.INDEX_NAMES_SUFFIXES.STATUS}`,
            partitionKey: { name: 'documentstatus', type: AttributeType.STRING },
            sortKey: { name: "documentownerid", type: AttributeType.STRING },
            projectionType: ProjectionType.ALL,
        });

        table.addGlobalSecondaryIndex({
            indexName: `${tableName}-${ResourceName.dynamoDbTables.INDEX_NAMES_SUFFIXES.OWNER}`,
            partitionKey: { name: 'documentownerid', type: AttributeType.STRING },
            projectionType: ProjectionType.ALL,
        });
    });
    tables = auditTables();
    tables.forEach((tableName) => {
        const table = new Table(scope, tableName, {
            tableName: tableName,
            partitionKey: { name: "auditid", type: AttributeType.STRING },
            ...defaultTablesSettings
        });
        table.addGlobalSecondaryIndex({
            indexName: `${tableName}-${ResourceName.dynamoDbTables.INDEX_NAMES_SUFFIXES.EVENT_INITIATOR_AND_DOC_ID}`,
            partitionKey: { name: 'eventInitiator', type: AttributeType.STRING },
            sortKey: { name: 'documentId', type: AttributeType.STRING },
            projectionType: ProjectionType.ALL,
        });
        table.addGlobalSecondaryIndex({
            indexName: `${tableName}-${ResourceName.dynamoDbTables.INDEX_NAMES_SUFFIXES.EVENT_INITIATOR_AND_ACTION}`,
            partitionKey: { name: 'eventinitiator', type: AttributeType.STRING },
            sortKey: { name: 'event', type: AttributeType.STRING },
            projectionType: ProjectionType.ALL,
        });
        table.addGlobalSecondaryIndex({
            indexName:`${tableName}-${ResourceName.dynamoDbTables.INDEX_NAMES_SUFFIXES.DOCUMENT_ID}`,
            partitionKey: { name: 'documentid', type: AttributeType.STRING },
            projectionType: ProjectionType.ALL,
        });
    });
    tables = verificationTables();
    tables.forEach((tableName) => {
        const table = new Table(scope, tableName, {
            tableName: tableName,
            partitionKey: { name: "verificationid", type: AttributeType.STRING },
            ...defaultTablesSettings
        });
        table.addGlobalSecondaryIndex({
            indexName: `${tableName}-${ResourceName.dynamoDbTables.INDEX_NAMES_SUFFIXES.DOCUMENT_ID_AND_STATUS}`,
            partitionKey: { name: 'documentid', type: AttributeType.STRING },
            sortKey: { name: "documentstatus", type: AttributeType.STRING },
            projectionType: ProjectionType.ALL,
        });
        
    });
}