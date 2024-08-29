import { Construct } from 'constructs';
import { 
    Cors, 
    JsonSchemaType, 
    LambdaIntegration, 
    Period, 
    RequestValidator, 
    Resource, RestApi
} from 'aws-cdk-lib/aws-apigateway';
import { ResourceName } from '../resource-reference';
import { isProduction } from '../../helpers/utilities';

import { getGeoDataCitiesLambda, getGeoDataCountriesLambda, getGeoDataStatesLambda, updateGeoDataCitiesLambda, updateGeoDataCountriesLambda, updateGeoDataStatesLambda } from './lambdas';

const apiVersion = 'v1';
const serviceName = 'Geolocation Service';
interface ApiNodes {
    country: Resource,
    state: Resource,
    city: Resource
}
/**
 * Function creates and configure API Gateway resources.
 * @param scope 
 */
export default function configureApiGatewayResources(scope: Construct) {
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

    const apiKey = apiGatewayInstance.addApiKey(ResourceName.apiGateway.API_KEY, {
        apiKeyName: ResourceName.apiGateway.API_KEY,
        description: `${serviceName}: API Key`,
    });
    usagePlan.addApiKey(apiKey);

    const requestValidatorInstance = new RequestValidator(scope, 
        ResourceName.apiGateway.API_REQUEST_VALIDATOR, {
            restApi: apiGatewayInstance,
            requestValidatorName: ResourceName.apiGateway.API_REQUEST_VALIDATOR,
            validateRequestBody: true,
            validateRequestParameters: false,
        }
    );
    const version = apiGatewayInstance.root.addResource(apiVersion);
    const parentNode =  version.addResource('geo');
    const apiNodes: ApiNodes = {
        country: parentNode.addResource('country'),
        state: parentNode.addResource('state'),
        city: parentNode.addResource('city'),
    };

    configureEndpoint(apiNodes.country, 'update', updateGeoDataCountriesLambda, null, requestValidatorInstance);
    configureEndpoint(apiNodes.country, 'get-list', getGeoDataCountriesLambda, null, requestValidatorInstance);
    
    configureEndpoint(apiNodes.state, 'update', updateGeoDataStatesLambda, null, requestValidatorInstance);
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
 * 
 * This function adds a POST method to the specified API Gateway resource. If the `isStepFunction` flag is true, it integrates with AWS Step Functions by starting an execution using the provided handler. If false, it integrates with a Lambda function. The method is secured with an API key and validates incoming requests using the provided request model and validator.
 */

function configureEndpoint(node: Resource, resourceName: string, handler: any, requestModel: any, validator: RequestValidator) {
    const method = new LambdaIntegration(handler());
    requestModel ? 
    node.addResource(resourceName).addMethod('POST', method, {
        apiKeyRequired: true,
        requestModels: { 'application/json': requestModel },
        requestValidator: validator,
    })
    : 
    node.addResource(resourceName).addMethod('POST', method, {
        apiKeyRequired: true
    });
}