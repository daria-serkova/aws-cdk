import { AttributeType, BillingMode, Table, TableClass, TableEncryption } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { IS_PRODUCTION, resourceName } from "../helpers/utilities";
import { RemovalPolicy } from "aws-cdk-lib";

let filesMetadataTableInstnce: Table | undefined;
let auditTableInstance: Table | undefined;

/**
 * Configuration of DynamoDB tables
 * @param scope 
 */
export function configureDatabases(scope: Construct ) {
    filesMetadataTableInstnce = new Table(scope, resourceName('files-metadata'), {
        tableName: resourceName('files-metadata'),
        partitionKey: { name: "id", type: AttributeType.STRING },
        billingMode: BillingMode.PAY_PER_REQUEST,
        tableClass: TableClass.STANDARD,
        encryption: TableEncryption.DEFAULT,
        removalPolicy: IS_PRODUCTION ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });
    auditTableInstance = new Table(scope, resourceName('audit'), {
        tableName: resourceName('audit'),
        partitionKey: { name: "id", type: AttributeType.STRING },
        billingMode: BillingMode.PAY_PER_REQUEST,
        tableClass: TableClass.STANDARD,
        encryption: TableEncryption.DEFAULT,
        removalPolicy: IS_PRODUCTION ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });
}

export const filesMetadataTable = () => filesMetadataTableInstnce;
export const auditTable = () => auditTableInstance;