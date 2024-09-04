import { AttributeType, BillingMode, ProjectionType, Table, TableClass, TableEncryption } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { isProduction } from "../../helpers/utils";
import { RemovalPolicy } from "aws-cdk-lib";
import { ResourceName } from "../resource-reference";

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
export default function configureDynamoDbResources(scope: Construct) {
    const userAccessEvents = new Table(scope, ResourceName.dynamodb.AUDIT_EVENTS_USER_ACCESS, {
        tableName: ResourceName.dynamodb.AUDIT_EVENTS_USER_ACCESS,
        partitionKey: { name: "eventid", type: AttributeType.STRING },
        sortKey: {name: 'timestamp', type: AttributeType.STRING },
        timeToLiveAttribute: 'ttl',
        ...defaultTablesSettings
    });
    userAccessEvents.addGlobalSecondaryIndex({
        indexName: ResourceName.dynamodb.AUDIT_EVENTS_USER_ACCESS_INDEX_BY_USER_ID,
        partitionKey: { name: 'requestorid', type: AttributeType.STRING },
        sortKey: { name: 'timestamp', type: AttributeType.STRING },
        projectionType: ProjectionType.ALL,
    });
    userAccessEvents.addGlobalSecondaryIndex({
        indexName: ResourceName.dynamodb.AUDIT_EVENTS_USER_ACCESS_INDEX_BY_IP,
        partitionKey: { name: 'requestorip', type: AttributeType.STRING },
        sortKey: { name: 'timestamp', type: AttributeType.STRING },
        projectionType: ProjectionType.ALL,
    });
}