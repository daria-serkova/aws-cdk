import { AttributeType, BillingMode, ProjectionType, Table, TableClass, TableEncryption } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { RemovalPolicy } from "aws-cdk-lib";
import { isProduction } from "../../helpers/utilities";
import { auditTables, metadataTables, ResourceName, verificationTables } from "../resource-reference";

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
    /* Documents Metadata per document type (Insurance, Billing, Patients, Legal, etc) */
    let tables = metadataTables();
    tables.forEach((tableName) => {
        let name = tableName.replace('$2', '');
        const table = new Table(scope, name, {
            tableName: name,
            partitionKey: { name: "documentid", type: AttributeType.STRING },
            ...defaultTablesSettings
        });
        name = tableName.replace('$2', `-${ResourceName.dynamoDbTables.INDEX_NAMES_SUFFIXES.STATUS_AND_OWNER}`);
        table.addGlobalSecondaryIndex({
            indexName: name,
            partitionKey: { name: 'documentstatus', type: AttributeType.STRING },
            sortKey: { name: "documentownerid", type: AttributeType.STRING },
            projectionType: ProjectionType.ALL,
        });
        name = tableName.replace('$2', `-${ResourceName.dynamoDbTables.INDEX_NAMES_SUFFIXES.OWNER}`);
        table.addGlobalSecondaryIndex({
            indexName: name,
            partitionKey: { name: 'documentownerid', type: AttributeType.STRING },
            projectionType: ProjectionType.ALL,
        });
    });
    /* Documents Audit per document type (Insurance, Billing, Patients, Legal, etc) */
    tables = auditTables();
    tables.forEach((tableName) => {
        let name = tableName.replace('$2', '');
        const table = new Table(scope, name, {
            tableName: name,
            partitionKey: { name: "auditid", type: AttributeType.STRING },
            ...defaultTablesSettings
        });
        name = tableName.replace('$2', `-${ResourceName.dynamoDbTables.INDEX_NAMES_SUFFIXES.EVENT_INITIATOR_AND_DOC_ID}`);
        table.addGlobalSecondaryIndex({
            indexName: name,
            partitionKey: { name: 'eventinitiator', type: AttributeType.STRING },
            sortKey: { name: 'documentid', type: AttributeType.STRING },
            projectionType: ProjectionType.ALL,
        });
        name = tableName.replace('$2', `-${ResourceName.dynamoDbTables.INDEX_NAMES_SUFFIXES.DOCUMENT_ID_AND_EVENT_INITIATOR}`);
        table.addGlobalSecondaryIndex({
            indexName: name,
            partitionKey: { name: 'documentid', type: AttributeType.STRING },
            projectionType: ProjectionType.ALL,
        });
    });
    /* Documents Verification records per document type (Insurance, Billing, Patients, Legal, etc) */
    tables = verificationTables();
    tables.forEach((tableName) => {
        let name = tableName.replace('$2', '');
        const table = new Table(scope, name, {
            tableName: name,
            partitionKey: { name: "verificationid", type: AttributeType.STRING },
            ...defaultTablesSettings
        });
        name = tableName.replace('$2', `-${ResourceName.dynamoDbTables.INDEX_NAMES_SUFFIXES.DOCUMENT_ID_AND_STATUS}`);
        table.addGlobalSecondaryIndex({
            indexName: name,
            partitionKey: { name: 'documentid', type: AttributeType.STRING },
            sortKey: { name: "documentstatus", type: AttributeType.STRING },
            projectionType: ProjectionType.ALL,
        });     
    });
}