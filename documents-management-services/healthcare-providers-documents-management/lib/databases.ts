import { AttributeType, BillingMode, Table, TableClass, TableEncryption } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { IS_PRODUCTION, resourceName } from "../helpers/utilities";
import { RemovalPolicy } from "aws-cdk-lib";

let filesMetadataTable: Table | undefined;
let auditTable: Table | undefined;

export function getFilesMetadataTable(): Table | undefined {
    return filesMetadataTable;
}
export function getAuditTable(): Table | undefined {
    return auditTable;
}
export function configureDatabases(scope: Construct ) {
    filesMetadataTable = new Table(scope, resourceName('files-metadata'), {
        tableName: resourceName('files-metadata'),
        partitionKey: { name: "id", type: AttributeType.STRING },
        billingMode: BillingMode.PAY_PER_REQUEST,
        tableClass: TableClass.STANDARD,
        encryption: TableEncryption.DEFAULT,
        removalPolicy: IS_PRODUCTION ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });
    auditTable = new Table(scope, resourceName('audit'), {
        tableName: resourceName('audit'),
        partitionKey: { name: "id", type: AttributeType.STRING },
        billingMode: BillingMode.PAY_PER_REQUEST,
        tableClass: TableClass.STANDARD,
        encryption: TableEncryption.DEFAULT,
        removalPolicy: IS_PRODUCTION ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });
}