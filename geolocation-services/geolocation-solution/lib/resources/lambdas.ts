import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { resolve, dirname } from 'path';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { 
    createLambdaRole,
    addCloudWatchPutPolicy, 
    addDynamoDbIndexReadPolicy, 
    addDynamoDbReadPolicy, 
    addDynamoDbWritePolicy 
} from './iam';
import { ResourceName } from '../resource-reference';

const lambdaFilesLocation = '../../functions';

let updateGeoDataCountriesLambdaInstance: NodejsFunction;
let updateGeoDataStatesLambdaInstance: NodejsFunction;
let updateGeoDataCitiesLambdaInstance: NodejsFunction;

let getGeoDataCountriesGetDropdownLambdaInstance: NodejsFunction;
let getGeoDataStatesGetDropdownLambdaInstance: NodejsFunction;
let getGeoDataCitiesGetDropdownLambdaInstance: NodejsFunction;

export const updateGeoDataCountriesLambda = () => updateGeoDataCountriesLambdaInstance;
export const updateGeoDataStatesLambda = () => updateGeoDataStatesLambdaInstance;
export const updateGeoDataCitiesLambda = () => updateGeoDataCitiesLambdaInstance;

export const getGeoDataCountriesGetDropdownLambda = () => getGeoDataCountriesGetDropdownLambdaInstance;
export const getGeoDataStatesGetDropdownLambda = () => getGeoDataStatesGetDropdownLambdaInstance;
export const getGeoDataCitiesGetDropdownLambda = () => getGeoDataCitiesGetDropdownLambdaInstance;

const defaultLambdaSettings = {
    memorySize: 256,
    timeout: Duration.minutes(3),
    handler: 'handler',
}
/**
 * Configuration of Lambda functions
 * @param scope 
 */
export default function configureLambdaResources(scope: Construct, logGroup: LogGroup) {
    updateGeoDataCountriesLambdaInstance = configureLambdaUpdateGeoDataCountries(scope, logGroup);
    getGeoDataCountriesGetDropdownLambdaInstance = configureLambdaGetGeoDataCountriesDropdown(scope, logGroup);
    
    updateGeoDataStatesLambdaInstance = configureLambdaUpdateGeoDataStates(scope, logGroup);
    getGeoDataStatesGetDropdownLambdaInstance = configureLambdaGetGeoDataStatesDropdown(scope, logGroup);

    updateGeoDataCitiesLambdaInstance = configureLambdaUpdateGeoDataCities(scope, logGroup);
    getGeoDataCitiesGetDropdownLambdaInstance = configureLambdaGetGeoDataCitiesDropdown(scope, logGroup);
}

const configureLambdaUpdateGeoDataCountries = (scope: Construct, logGroup: LogGroup): NodejsFunction => {
    const iamRole = createLambdaRole(scope, ResourceName.iam.LAMBDA_UPDATE_GEO_DATA_COUNTRIES);
    addCloudWatchPutPolicy(iamRole, logGroup.logGroupName);
    addDynamoDbWritePolicy(iamRole, ResourceName.dynamoDb.GEO_DATA_COUNTRIES_TABLE);
    const lambda = new NodejsFunction(scope, ResourceName.lambda.LAMBDA_UPDATE_GEO_DATA_COUNTRIES, {
        functionName: ResourceName.lambda.LAMBDA_UPDATE_GEO_DATA_COUNTRIES,
        description: 'Updates geo data (countries) with latest values',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/geo-data-update-countries.ts`),
        logGroup: logGroup,
        role: iamRole,
        environment: {
            REGION: process.env.AWS_REGION || '',
            AWS_RESOURCES_NAME_PREFIX: process.env.AWS_RESOURCES_NAME_PREFIX || '',
            TAG_ENVIRONMENT: process.env.TAG_ENVIRONMENT || '',
            GEONAMES_USERNAME: process.env.GEONAMES_USERNAME || ''
        },
        ...defaultLambdaSettings
    });
    return lambda;   
}
const configureLambdaGetGeoDataCountriesDropdown = (scope: Construct, logGroup: LogGroup): NodejsFunction => {
    const iamRole = createLambdaRole(scope, ResourceName.iam.LAMBDA_GET_GEO_DATA_COUNTRIES);
    addCloudWatchPutPolicy(iamRole, logGroup.logGroupName);
    addDynamoDbReadPolicy(iamRole, ResourceName.dynamoDb.GEO_DATA_COUNTRIES_TABLE);
    const lambda = new NodejsFunction(scope, ResourceName.lambda.LAMBDA_GET_GEO_DATA_COUNTRIES, {
        functionName: ResourceName.lambda.LAMBDA_GET_GEO_DATA_COUNTRIES,
        description: 'Retreives geo data (countries)',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/geo-data-get-countries-dropdown-values.ts`),
        logGroup: logGroup,
        role: iamRole,
        environment: {
            REGION: process.env.AWS_REGION || '',
            AWS_RESOURCES_NAME_PREFIX: process.env.AWS_RESOURCES_NAME_PREFIX || '',
            TAG_ENVIRONMENT: process.env.TAG_ENVIRONMENT || '',
        },
        ...defaultLambdaSettings
    });
    return lambda;   
}
const configureLambdaUpdateGeoDataStates = (scope: Construct, logGroup: LogGroup): NodejsFunction => {
    const iamRole = createLambdaRole(scope, ResourceName.iam.LAMBDA_UPDATE_GEO_DATA_STATES);
    addCloudWatchPutPolicy(iamRole, logGroup.logGroupName);
    addDynamoDbReadPolicy(iamRole, ResourceName.dynamoDb.GEO_DATA_COUNTRIES_TABLE);
    addDynamoDbIndexReadPolicy(iamRole, ResourceName.dynamoDb.GEO_DATA_COUNTRIES_TABLE, ResourceName.dynamoDb.GEO_DATA_INDEX_COUNTRY_CODE);
    addDynamoDbWritePolicy(iamRole, ResourceName.dynamoDb.GEO_DATA_STATES_TABLE);
    const lambda = new NodejsFunction(scope, ResourceName.lambda.LAMBDA_UPDATE_GEO_DATA_STATES, {
        functionName: ResourceName.lambda.LAMBDA_UPDATE_GEO_DATA_STATES,
        description: 'Updates geo data (states) with latest values',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/geo-data-update-states.ts`),
        logGroup: logGroup,
        role: iamRole,
        environment: {
            REGION: process.env.AWS_REGION || '',
            AWS_RESOURCES_NAME_PREFIX: process.env.AWS_RESOURCES_NAME_PREFIX || '',
            TAG_ENVIRONMENT: process.env.TAG_ENVIRONMENT || '',
            GEONAMES_USERNAME: process.env.GEONAMES_USERNAME || ''
        },
        ...defaultLambdaSettings
    });
    return lambda;   
}
const configureLambdaGetGeoDataStatesDropdown = (scope: Construct, logGroup: LogGroup): NodejsFunction => {
    const iamRole = createLambdaRole(scope, ResourceName.iam.LAMBDA_GET_GEO_DATA_STATES);
    addCloudWatchPutPolicy(iamRole, logGroup.logGroupName);
    addDynamoDbIndexReadPolicy(iamRole, ResourceName.dynamoDb.GEO_DATA_STATES_TABLE, ResourceName.dynamoDb.GEO_DATA_INDEX_COUNTRY_CODE);
    const lambda = new NodejsFunction(scope, ResourceName.lambda.LAMBDA_GET_GEO_DATA_STATES, {
        functionName: ResourceName.lambda.LAMBDA_GET_GEO_DATA_STATES,
        description: 'Get geo data (states)',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/geo-data-get-states-dropdown-values.ts`),
        logGroup: logGroup,
        role: iamRole,
        environment: {
            REGION: process.env.AWS_REGION || '',
            AWS_RESOURCES_NAME_PREFIX: process.env.AWS_RESOURCES_NAME_PREFIX || '',
            TAG_ENVIRONMENT: process.env.TAG_ENVIRONMENT || '',
        },
        ...defaultLambdaSettings,
    });
    return lambda;   
}
const configureLambdaUpdateGeoDataCities = (scope: Construct, logGroup: LogGroup): NodejsFunction => {
    const iamRole = createLambdaRole(scope, ResourceName.iam.LAMBDA_UPDATE_GEO_DATA_CITIES);
    addCloudWatchPutPolicy(iamRole, logGroup.logGroupName);
    addDynamoDbReadPolicy(iamRole, ResourceName.dynamoDb.GEO_DATA_STATES_TABLE);
    addDynamoDbIndexReadPolicy(iamRole, ResourceName.dynamoDb.GEO_DATA_STATES_TABLE, ResourceName.dynamoDb.GEO_DATA_INDEX_COUNTRY_CODE);
    addDynamoDbWritePolicy(iamRole, ResourceName.dynamoDb.GEO_DATA_CITIES_TABLE);
    const lambda = new NodejsFunction(scope, ResourceName.lambda.LAMBDA_UPDATE_GEO_DATA_CITIES, {
        functionName: ResourceName.lambda.LAMBDA_UPDATE_GEO_DATA_CITIES,
        description: 'Updates geo data (cities) with latest values',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/geo-data-update-cities.ts`),
        logGroup: logGroup,
        role: iamRole,
        environment: {
            REGION: process.env.AWS_REGION || '',
            AWS_RESOURCES_NAME_PREFIX: process.env.AWS_RESOURCES_NAME_PREFIX || '',
            TAG_ENVIRONMENT: process.env.TAG_ENVIRONMENT || '',
            GEONAMES_USERNAME: process.env.GEONAMES_USERNAME || ''
        },
        ...defaultLambdaSettings,
        timeout: Duration.minutes(15),
    });
    return lambda;   
}

const configureLambdaGetGeoDataCitiesDropdown = (scope: Construct, logGroup: LogGroup): NodejsFunction => {
    const iamRole = createLambdaRole(scope, ResourceName.iam.LAMBDA_GET_GEO_DATA_CITIES);
    addCloudWatchPutPolicy(iamRole, logGroup.logGroupName);
    addDynamoDbIndexReadPolicy(iamRole, ResourceName.dynamoDb.GEO_DATA_CITIES_TABLE, ResourceName.dynamoDb.GEO_DATA_INDEX_COUNTRY_CODE);
    const lambda = new NodejsFunction(scope, ResourceName.lambda.LAMBDA_GET_GEO_DATA_CITIES, {
        functionName: ResourceName.lambda.LAMBDA_GET_GEO_DATA_CITIES,
        description: 'Get geo data (cities)',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/geo-data-get-cities-dropdown-values.ts`),
        logGroup: logGroup,
        role: iamRole,
        environment: {
            REGION: process.env.AWS_REGION || '',
            AWS_RESOURCES_NAME_PREFIX: process.env.AWS_RESOURCES_NAME_PREFIX || '',
            TAG_ENVIRONMENT: process.env.TAG_ENVIRONMENT || '',
        },
        ...defaultLambdaSettings,
    });
    return lambda;   
}