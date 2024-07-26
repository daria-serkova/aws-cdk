
import { Construct } from "constructs";
import { Cors, JsonSchemaType, LambdaIntegration, Period, RequestValidator, Resource, RestApi } from "aws-cdk-lib/aws-apigateway";
import { ResourceName } from "../resource-reference";
import { isProduction } from "../../helpers/utilities";
import { deliverySendLambda, templateUpdateLambda } from "./lambdas";

interface ApiNodes {
    templatesNode: Resource;
    deliveryNode: Resource;
    reportsNode: Resource;
}
let apiNodesInstance: ApiNodes;

/**
 * Configuration of API Gateway
 * @param scope 
 */
export function configureApiGatewayResources(scope: Construct ) {
    const apiGatewayInstance = new RestApi(scope, ResourceName.apiGateway.EMAILS_SERVCIE_GATEWAY, {
        restApiName: ResourceName.apiGateway.EMAILS_SERVCIE_GATEWAY,
        description: 'Emails Management Solution API endpoints',
        deployOptions: {
            stageName: isProduction ? "prod" : "dev",
            tracingEnabled: true,
        },
        defaultCorsPreflightOptions: {
            allowOrigins: Cors.ALL_ORIGINS,
            allowMethods: ["POST"],
        },
    });
    // Usage Plan for API keys and quotas
    const usageplan = apiGatewayInstance.addUsagePlan(ResourceName.apiGateway.EMAILS_SERVCIE_API_USAGE_PLAN, {
        name: ResourceName.apiGateway.EMAILS_SERVCIE_API_USAGE_PLAN,
        description:  "Usage plan used for Emails Management Solution API",
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
    const apiKey = apiGatewayInstance.addApiKey(ResourceName.apiGateway.EMAILS_SERVCIE_API_KEY, {
        apiKeyName: ResourceName.apiGateway.EMAILS_SERVCIE_API_KEY,
        description: `API Key for Emails Management Solution API`,
    });
    usageplan.addApiKey(apiKey);

    const requestValidatorInstance = new RequestValidator(scope, 
        ResourceName.apiGateway.EMAILS_SERVCIE_API_REQUEST_VALIDATOR, 
        {
            restApi: apiGatewayInstance,
            requestValidatorName: ResourceName.apiGateway.EMAILS_SERVCIE_API_REQUEST_VALIDATOR,
            validateRequestBody: true,
            validateRequestParameters: false,
        }
    );
    const version = apiGatewayInstance.root.addResource('v1');
    apiNodesInstance = {
        templatesNode: version.addResource('templates'),
        deliveryNode: version.addResource('delivery'),
        reportsNode: version.addResource('reports'),
    }
    configureTemplateUpdateEndpoint(apiGatewayInstance, apiNodesInstance.templatesNode, requestValidatorInstance);
    configureDeliverySendEndpoint(apiGatewayInstance, apiNodesInstance.deliveryNode, requestValidatorInstance);
}

function configureTemplateUpdateEndpoint(apiGateway: RestApi, node: Resource, requestValidatorInstance: RequestValidator) {
    const modelName = ResourceName.apiGateway.EMAILS_SERVCIE_REQUEST_MODEL_TEMPLATE_UPDATE;
    let requestModel = {
        contentType: "application/json",
        description: "Email Template update API endpoint body validation",
        modelName: modelName,
        modelId: modelName,
        schema: {
            type: JsonSchemaType.OBJECT,
            properties: {
                templateId: {
                    type: JsonSchemaType.STRING,
                },
                updatedBy: {
                    type: JsonSchemaType.STRING,
                },
                templateData: {
                    type: JsonSchemaType.OBJECT
                }
            },
            required: ["templateId", "updatedBy", "templateData"],
        },
    };
    apiGateway.addModel(modelName, requestModel);
    node.addResource('update').addMethod("POST", new LambdaIntegration(templateUpdateLambda()), {
        apiKeyRequired: true,
        requestModels: { "application/json": requestModel },
        requestValidator: requestValidatorInstance,
    });
}
function configureDeliverySendEndpoint(apiGateway: RestApi, node: Resource, requestValidatorInstance: RequestValidator) {
    const modelName = ResourceName.apiGateway.EMAILS_SERVCIE_REQUEST_MODEL_DELIVERY_SEND;
    let requestModel = {
        contentType: "application/json",
        description: "Email Send API endpoint body validation",
        modelName: modelName,
        modelId: modelName,
        schema: {
            type: JsonSchemaType.OBJECT,
            properties: {
                templateId: {
                    type: JsonSchemaType.STRING,
                },
                recipient: {
                    type: JsonSchemaType.STRING,
                },
                emailData: {
                    type: JsonSchemaType.OBJECT
                },
                sentBy: {
                    type: JsonSchemaType.STRING
                },
                
            },
            required: ["templateId", "recipient", "emailData", "sentBy"],
        },
    };
    apiGateway.addModel(modelName, requestModel);
    node.addResource('send').addMethod("POST", new LambdaIntegration(deliverySendLambda()), {
        apiKeyRequired: true,
        requestModels: { "application/json": requestModel },
        requestValidator: requestValidatorInstance,
    });
}