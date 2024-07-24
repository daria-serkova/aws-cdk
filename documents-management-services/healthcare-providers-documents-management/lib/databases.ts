import { AttributeType, BillingMode, Table, TableClass, TableEncryption } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { IS_PRODUCTION, resourceName } from "../helpers/utilities";
import { RemovalPolicy } from "aws-cdk-lib";

export const DatabasesNames = {
    DOCUMENTS_METADATA: resourceName('files-metadata'),
    AUDIT: resourceName('audit')
}
/**
 * Configuration of DynamoDB tables
 * @param scope 
 */
export function configureDatabases(scope: Construct ) {
    new Table(scope, DatabasesNames.DOCUMENTS_METADATA, {
        tableName: DatabasesNames.DOCUMENTS_METADATA,
        partitionKey: { name: "id", type: AttributeType.STRING },
        billingMode: BillingMode.PAY_PER_REQUEST,
        tableClass: TableClass.STANDARD,
        encryption: TableEncryption.DEFAULT,
        removalPolicy: IS_PRODUCTION ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });
    
    new Table(scope, DatabasesNames.AUDIT, {
        tableName: DatabasesNames.AUDIT,
        partitionKey: { name: "id", type: AttributeType.STRING },
        billingMode: BillingMode.PAY_PER_REQUEST,
        tableClass: TableClass.STANDARD,
        encryption: TableEncryption.DEFAULT,
        removalPolicy: IS_PRODUCTION ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });
}