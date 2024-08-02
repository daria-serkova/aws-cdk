
import { Construct } from "constructs";
import { Cors, JsonSchemaType, LambdaIntegration, Period, RequestValidator, Resource, RestApi, StepFunctionsIntegration } from "aws-cdk-lib/aws-apigateway";
import { ResourceName } from "../resource-reference";
import { isProduction } from "../../helpers/utilities";
import { SupportedDocumentsCategories, SupportedDocumentsFormats, SupportedInitiatorSystemCodes } from "../../functions/helpers/utilities";
import { workflowDocumentUploadBase64, workflowGetDocumentDetails } from "./state-machines";
import { auditGetEventsLambda } from "./lambdas";

interface ApiNodes {
    document: Resource;
    audit: Resource;
}
let apiNodesInstance: ApiNodes;

/**
 * Configuration of API Gateway
 * @param scope 
 */
export default function configureApiGatewayResources(scope: Construct ) {
    const apiGatewayInstance = new RestApi(scope, ResourceName.apiGateway.DOCUMENTS_SERVCIE_GATEWAY, {
        restApiName: ResourceName.apiGateway.DOCUMENTS_SERVCIE_GATEWAY,
        description: 'Documents Management Solution API endpoints',
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
    const usageplan = apiGatewayInstance.addUsagePlan(ResourceName.apiGateway.DOCUMENTS_SERVCIE_API_USAGE_PLAN, {
        name: ResourceName.apiGateway.DOCUMENTS_SERVCIE_API_USAGE_PLAN,
        description:  "Usage plan used for Documents Management Solution API",
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
    const apiKey = apiGatewayInstance.addApiKey(ResourceName.apiGateway.DOCUMENTS_SERVCIE_API_KEY, {
        apiKeyName: ResourceName.apiGateway.DOCUMENTS_SERVCIE_API_KEY,
        description: `API Key for Documents Management Solution API`,
    });
    usageplan.addApiKey(apiKey);

    const requestValidatorInstance = new RequestValidator(scope, 
        ResourceName.apiGateway.DOCUMENTS_SERVCIE_API_REQUEST_VALIDATOR, 
        {
            restApi: apiGatewayInstance,
            requestValidatorName: ResourceName.apiGateway.DOCUMENTS_SERVCIE_API_REQUEST_VALIDATOR,
            validateRequestBody: true,
            validateRequestParameters: false,
        }
    );
    const version = apiGatewayInstance.root.addResource('v1');
    apiNodesInstance = {
        document: version.addResource('document'),
        audit: version.addResource('audit'),
    }
    /* Documents endpoints */
    configureDocumentUploadBase64Endpoint(apiGatewayInstance, apiNodesInstance.document, requestValidatorInstance);
    configureGetDocumentDetailsEndpoint(apiGatewayInstance, apiNodesInstance.document, requestValidatorInstance);
    /* Audit endpoints */
    configureAuditGetEventsEndpoint(apiGatewayInstance, apiNodesInstance.audit, requestValidatorInstance);
}

function configureDocumentUploadBase64Endpoint(apiGateway: RestApi, node: Resource, requestValidatorInstance: RequestValidator) {
    const modelName = ResourceName.apiGateway.DOCUMENTS_SERVCIE_REQUEST_MODEL_DOCUMENT_UPLOAD_BASE64;
    let requestModel = {
        contentType: "application/json",
        description: "Document base64 upload API endpoint body validation",
        modelName: modelName,
        modelId: modelName,
        schema: {
            type: JsonSchemaType.OBJECT,
            properties: {
                initiatorSystemCode: {
                    type: JsonSchemaType.STRING,
                    enum: SupportedInitiatorSystemCodes
                },
                requestorId: {
                    type: JsonSchemaType.STRING
                },
                documentOwnerId: {
                    type: JsonSchemaType.STRING,
                },
                documentFormat: {
                    type: JsonSchemaType.STRING,
                    enum: SupportedDocumentsFormats
                },
                documentCategory: {
                    type: JsonSchemaType.STRING,
                    enum: SupportedDocumentsCategories, 
                }, 
                documentSize: {
                    type: JsonSchemaType.NUMBER,
                },
                documentContent: {
                    type: JsonSchemaType.STRING,
                },
                metadata: {
                    type: JsonSchemaType.OBJECT,
                },
            },
            required: [
               "initiatorSystemCode",
               "requestorId",
               "documentOwnerId",
               "documentFormat",
               "documentCategory",
               "documentSize",
               "documentContent"
            ],
        },
    };
    apiGateway.addModel(modelName, requestModel);
    node.addResource("upload-base64").addMethod('POST', StepFunctionsIntegration.startExecution(workflowDocumentUploadBase64()), {
        apiKeyRequired: true,
        requestModels: { "application/json": requestModel },
        requestValidator: requestValidatorInstance,
    })
}
function configureGetDocumentDetailsEndpoint(apiGateway: RestApi, node: Resource, requestValidatorInstance: RequestValidator) {
    const modelName = ResourceName.apiGateway.DOCUMENTS_SERVCIE_REQUEST_MODEL_DOCUMENT_GET_DETAILS;
    let requestModel = {
        contentType: "application/json",
        description: "Request model: Get Document Details API endpoint",
        modelName: modelName,
        modelId: modelName,
        schema: {
            type: JsonSchemaType.OBJECT,
            properties: {
                initiatorSystemCode: {
                    type: JsonSchemaType.STRING,
                    enum: SupportedInitiatorSystemCodes
                },
                documentId: {
                    type: JsonSchemaType.STRING,
                },
                requestorId: {
                    type: JsonSchemaType.STRING,
                },
            },
            required: [
                "initiatorSystemCode", 
                "documentId",
                "requestorId"
            ],
        },
    };
    apiGateway.addModel(modelName, requestModel);
    node.addResource("get-details").addMethod('POST', StepFunctionsIntegration.startExecution(workflowGetDocumentDetails()), {
        apiKeyRequired: true,
        requestModels: { "application/json": requestModel },
        requestValidator: requestValidatorInstance,
    })
}
function configureAuditGetEventsEndpoint(apiGateway: RestApi, node: Resource, requestValidatorInstance: RequestValidator) {
    const modelName = ResourceName.apiGateway.AUDIT_REQUEST_MODEL_GET_EVENTS;
    let requestModel = {
        contentType: "application/json",
        description: "Audit: Get List of events",
        modelName: modelName,
        modelId: modelName,
        schema: {
            type: JsonSchemaType.OBJECT,
            properties: {
                initiatorSystemCode: {
                    type: JsonSchemaType.STRING,
                    enum: SupportedInitiatorSystemCodes
                },
                action: {
                    type: JsonSchemaType.STRING,
                    enum: [ 'USER', 'DOCUMENT']
                },
                userId: {
                    type: JsonSchemaType.STRING,
                },
                documentId: {
                    type: JsonSchemaType.STRING,
                },
            },
            required: [
                "initiatorSystemCode",
                "action",
                "userId",
                "documentId"
            ],
        },
    };
    apiGateway.addModel(modelName, requestModel);
    node.addResource('get-events').addMethod("POST", new LambdaIntegration(auditGetEventsLambda()), {
        apiKeyRequired: true,
        requestModels: { "application/json": requestModel },
        requestValidator: requestValidatorInstance,
    });
}