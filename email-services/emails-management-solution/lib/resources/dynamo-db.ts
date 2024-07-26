import { AttributeType, BillingMode, Table, TableClass, TableEncryption } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { RemovalPolicy } from "aws-cdk-lib";
import { isProduction } from "../../helpers/utilities";
import { ResourceName } from "../resource-reference";

/**
 * Creation and configuration of DynamoDB tables.
 * @param scope 
 */
export default function configureDynamoDbResources(scope: Construct ) {
    new Table(scope, ResourceName.dynamoDbTables.EMAIL_LOGS, {
        tableName: ResourceName.dynamoDbTables.EMAIL_LOGS,
        partitionKey: { name: "emailId", type: AttributeType.STRING },
        billingMode: BillingMode.PAY_PER_REQUEST,
        tableClass: TableClass.STANDARD,
        encryption: TableEncryption.DEFAULT,
        removalPolicy: isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });
    new Table(scope, ResourceName.dynamoDbTables.EMAIL_TEMPLATES_LOGS, {
        tableName: ResourceName.dynamoDbTables.EMAIL_TEMPLATES_LOGS,
        partitionKey: { name: 'changeId', type: AttributeType.STRING },
        sortKey: { name: 'templateId', type: AttributeType.STRING },
        billingMode: BillingMode.PAY_PER_REQUEST,
        tableClass: TableClass.STANDARD,
        encryption: TableEncryption.DEFAULT,
        removalPolicy: isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });
}