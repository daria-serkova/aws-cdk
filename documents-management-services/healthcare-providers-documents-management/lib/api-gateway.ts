
import { Construct } from "constructs";
import { IS_PRODUCTION, resourceName } from "../helpers/utilities";
import { AwsIntegration, Cors, Period, RequestValidator, Resource, RestApi } from "aws-cdk-lib/aws-apigateway";
import { uploadDocumentsStateMachineIntegration } from "./state-machines";

interface ApiNodes {
    documentsNode: Resource;
}

let apiGatewayInstance: RestApi | undefined;
let apiNodesInstance: ApiNodes;
let requestValidatorInstance: RequestValidator | undefined;

/**
 * Configuration of API Gateway
 * @param scope 
 */
export function configureApiGateway(scope: Construct ) {
    apiGatewayInstance = new RestApi(scope, resourceName('api'), {
        restApiName: resourceName('api'),
        description: 'Documents Management Solution API endpoints',
        deployOptions: {
            stageName: IS_PRODUCTION ? "prod" : "dev",
            tracingEnabled: true,
        },
        defaultCorsPreflightOptions: {
            allowOrigins: Cors.ALL_ORIGINS,
            allowMethods: ["POST"],
        },
    });
    // Usage Plan for API keys and quotas
    const usageplan = apiGatewayInstance.addUsagePlan(resourceName('usage-plan'), {
        name: resourceName('usage-plan'),
        description:  "Usage plan used for DMS API Gateway",
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
    // API Key for authorization
    const apiKey = apiGatewayInstance.addApiKey(resourceName('X-API-KEY'), {
        apiKeyName: resourceName('X-API-KEY'),
        description: `API Key for DMS API Gateway`,
    });
    usageplan.addApiKey(apiKey);

    requestValidatorInstance = new RequestValidator(scope, resourceName('request-validator'), {
        restApi: apiGatewayInstance,
        requestValidatorName: resourceName('request-validator'),
        validateRequestBody: true,
        validateRequestParameters: false,
    });

    const version = apiGatewayInstance.root.addResource('v1');
    apiNodesInstance = {
        documentsNode: version.addResource('documents')
    }
    
    apiNodesInstance.documentsNode.addResource('upload-documents')
        .addMethod("POST", uploadDocumentsStateMachineIntegration());
    apiNodesInstance.documentsNode.addResource('start-document-verification');
    apiNodesInstance.documentsNode.addResource('confirm-document-verification');
    apiNodesInstance.documentsNode.addResource('reject-document-verification');

}

export const apiGateway = () => apiGatewayInstance;
export const apiNodes = () => apiNodesInstance;
export const requestValidator = () => requestValidatorInstance;