import { Construct } from 'constructs';
import { RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, BillingMode, ProjectionType, Table, TableClass, TableEncryption } from 'aws-cdk-lib/aws-dynamodb';
import { isProduction } from '../../helpers/utilities';
import { ResourceName } from '../resource-reference';

const defaultTablesSettings = {
    partitionKey: { name: 'geonameId', type: AttributeType.NUMBER },
    billingMode: BillingMode.PAY_PER_REQUEST,
    tableClass: TableClass.STANDARD,
    encryption: TableEncryption.DEFAULT,
    removalPolicy: isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
}
/**
 * Creation and configuration of DynamoDB tables and associated indexes.
 * @param scope 
 */
export default function configureDynamoDbResources(scope: Construct ) {
    const countries = new Table(scope, ResourceName.dynamoDb.GEO_DATA_COUNTRIES_TABLE, {
        tableName: ResourceName.dynamoDb.GEO_DATA_COUNTRIES_TABLE,
        ...defaultTablesSettings
    });
    countries.addGlobalSecondaryIndex({
        indexName: ResourceName.dynamoDb.GEO_DATA_INDEX_COUNTRY_CODE,
        partitionKey: { name: 'countryCode', type: AttributeType.STRING },
        projectionType: ProjectionType.ALL,
    });
    const states = new Table(scope, ResourceName.dynamoDb.GEO_DATA_STATES_TABLE, {
        tableName: ResourceName.dynamoDb.GEO_DATA_STATES_TABLE,
        ...defaultTablesSettings
    });
    states.addGlobalSecondaryIndex({
        indexName: ResourceName.dynamoDb.GEO_DATA_INDEX_COUNTRY_CODE,
        partitionKey: { name: 'countryCode', type: AttributeType.STRING },
        projectionType: ProjectionType.ALL,
    });
    const cities = new Table(scope, ResourceName.dynamoDb.GEO_DATA_CITIES_TABLE, {
        tableName: ResourceName.dynamoDb.GEO_DATA_CITIES_TABLE,
        ...defaultTablesSettings
    });
    cities.addGlobalSecondaryIndex({
        indexName: ResourceName.dynamoDb.GEO_DATA_INDEX_COUNTRY_CODE,
        partitionKey: { name: 'stateCode', type: AttributeType.STRING },
        projectionType: ProjectionType.ALL,
    });
}