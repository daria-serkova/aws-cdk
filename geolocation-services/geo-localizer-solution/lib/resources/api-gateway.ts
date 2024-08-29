import { Construct } from 'constructs';
import { 
    Cors, 
    JsonSchemaType, 
    LambdaIntegration, 
    Period, 
    RequestValidator, 
    Resource, 
    RestApi
} from 'aws-cdk-lib/aws-apigateway';
import { ResourceName } from '../resource-reference';
import { isProduction, SupportedCountries, SupportedLanguages } from '../../helpers/utilities';

import { 
    getGeoDataCitiesLambda, 
    getGeoDataCountriesLambda, 
    getGeoDataStatesLambda, 
    updateGeoDataCitiesLambda, 
    updateGeoDataCountriesLambda, 
    updateGeoDataStatesLambda 
} from './lambdas';

const apiVersion = 'v1';
const serviceName = 'Geolocation Service';

interface ApiNodes {
    country: Resource,
    state: Resource,
    city: Resource
}

/**
 * Function creates and configures API Gateway resources for the Geolocation Service.
 * @param scope - The CDK construct scope within which the API Gateway is defined.
 */
export default function configureApiGatewayResources(scope: Construct) {
    // Create a new RestApi instance with CORS and stage configuration.
    const apiGatewayInstance = new RestApi(scope, ResourceName.apiGateway.API_GATEWAY, {
        restApiName: ResourceName.apiGateway.API_GATEWAY,
        description: `${serviceName}: API Layer`,
        deployOptions: {
            stageName: isProduction ? 'prod' : 'dev',
            tracingEnabled: true,
        },
        defaultCorsPreflightOptions: {
            allowOrigins: Cors.ALL_ORIGINS,
            allowMethods: ['POST'],
        },
    });

    // Set up a usage plan with quotas and throttling limits.
    const usagePlan = apiGatewayInstance.addUsagePlan(ResourceName.apiGateway.API_USAGE_PLAN, {
        name: ResourceName.apiGateway.API_USAGE_PLAN,
        description: `${serviceName}: Usage Plan`,
        apiStages: [{
            api: apiGatewayInstance,
            stage: apiGatewayInstance.deploymentStage,
        }],
        quota: {
            limit: 10000,
            period: Period.DAY,
        },
        throttle: {
            rateLimit: 20,
            burstLimit: 10,
        },
    });

    // Add an API key for secure access to the API.
    const apiKey = apiGatewayInstance.addApiKey(ResourceName.apiGateway.API_KEY, {
        apiKeyName: ResourceName.apiGateway.API_KEY,
        description: `${serviceName}: API Key`,
    });
    usagePlan.addApiKey(apiKey);

    // Create a request validator that validates the request body.
    const requestValidatorInstance = new RequestValidator(scope, 
        ResourceName.apiGateway.API_REQUEST_VALIDATOR, {
            restApi: apiGatewayInstance,
            requestValidatorName: ResourceName.apiGateway.API_REQUEST_VALIDATOR,
            validateRequestBody: true,
            validateRequestParameters: false,
        }
    );

    // Set up the API version and main resource nodes.
    const version = apiGatewayInstance.root.addResource(apiVersion);
    const parentNode = version.addResource('geo');
    const apiNodes: ApiNodes = {
        country: parentNode.addResource('country'),
        state: parentNode.addResource('state'),
        city: parentNode.addResource('city'),
    };

    // Configure endpoints for each geo data resource (country, state, city).
    configureEndpoint(apiNodes.country, 'update', updateGeoDataCountriesLambda, null, requestValidatorInstance);
    configureEndpoint(apiNodes.country, 'get-list', getGeoDataCountriesLambda, requestModelGetCountriesList(apiGatewayInstance), requestValidatorInstance);
    
    configureEndpoint(apiNodes.state, 'update', updateGeoDataStatesLambda, requestModelUpdateStatesList(apiGatewayInstance), requestValidatorInstance);
    configureEndpoint(apiNodes.state, 'get-list', getGeoDataStatesLambda, null, requestValidatorInstance);
    
    configureEndpoint(apiNodes.city, 'update', updateGeoDataCitiesLambda, null, requestValidatorInstance);
    configureEndpoint(apiNodes.city, 'get-list', getGeoDataCitiesLambda, null, requestValidatorInstance);
}

/**
 * Configures an API Gateway endpoint for a given resource.
 * 
 * @param {Resource} node - The API Gateway resource node where the endpoint will be added.
 * @param {string} resourceName - The name of the resource (path) to be added under the node.
 * @param {any} handler - The handler function (Lambda or Step Functions) to be invoked by the endpoint.
 * @param {any} requestModel - The request model to be used for validating the request body.
 * @param {RequestValidator} validator - The request validator that will be used to validate the incoming request.
 */
function configureEndpoint(node: Resource, resourceName: string, handler: any, requestModel: any, validator: RequestValidator) {
    const method = new LambdaIntegration(handler());
    node.addResource(resourceName).addMethod('POST', method, {
        apiKeyRequired: true,
        requestModels: requestModel ? { 'application/json': requestModel } : undefined,
        requestValidator: validator,
    });
}

/**
 * Creates a request model for the Get Countries List API endpoint.
 * 
 * @param {RestApi} apiGateway - The API Gateway instance where the model will be added.
 * @returns The request model to be used for validating the Get Countries List API.
 */
const requestModelGetCountriesList = (apiGateway: RestApi) => {
    const requestModel = createRequestModel(`${serviceName}: Request Model - Get Countries List API`, {
        language: createStringProperty(SupportedLanguages),
    }, ['language']);
    return apiGateway.addModel(ResourceName.apiGateway.REQUEST_MODEL_GEO_COUNTRY_GET_LIST, requestModel);
};
/**
 * Creates a request model for the Update States API endpoint.
 * 
 * @param {RestApi} apiGateway - The API Gateway instance where the model will be added.
 * @returns The request model to be used for validating the pdate States API.
 */
 const requestModelUpdateStatesList = (apiGateway: RestApi) => {
    const requestModel = createRequestModel(`${serviceName}: Request Model - Update States List API`, {
        countryCode: createStringProperty([...SupportedCountries, '*']),
    }, ['countryCode']);
    return apiGateway.addModel(ResourceName.apiGateway.REQUEST_MODEL_GEO_STATES_UPDATE_LIST, requestModel);
};

/**
 * Creates a request model with specified properties and validation rules.
 * 
 * @param {string} description - A description of the request model.
 * @param {any} properties - The JSON schema properties for the model.
 * @param {string[]} required - An array of required properties for the model.
 * @returns A JSON schema model for validating API request bodies.
 */
function createRequestModel(description: string, properties: any, required: string[]) {
    return {
        contentType: 'application/json',
        description,
        schema: {
            type: JsonSchemaType.OBJECT,
            properties,
            required,
        },
    };
}

/**
 * Creates a JSON schema property definition for a string type.
 * 
 * @param {string[]} [enumValues] - An optional array of string values that the property is allowed to take.
 * @param {string} [pattern] - An optional regex pattern that the property value must match.
 * @returns A JSON schema definition for a string property.
 */
function createStringProperty(enumValues?: string[], pattern?: string) {
    const property: any = { type: JsonSchemaType.STRING };
    if (enumValues) property.enum = enumValues;
    if (pattern) property.pattern = pattern;
    return property;
}
