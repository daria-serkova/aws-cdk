
import { Construct } from "constructs";
import { Cors, JsonSchemaType, LambdaIntegration, Period, RequestValidator, Resource, RestApi, StepFunctionsIntegration } from "aws-cdk-lib/aws-apigateway";
import { ResourceName } from "../resource-reference";
import { isProduction } from "../../helpers/utilities";
import { AllowedDocumentSize, SupportedDocumentsCategories, SupportedDocumentsFormats, SupportedDocumentStatuses, SupportedDocumentTypes, SupportedInitiatorSystemCodes } from "../../functions/helpers/utilities";
import * as workflows from "./state-machines";
import { auditGetEventsLambda, documentGeneratePreSignedUploadUrlsLambda, documentGetListByOwnerLambda, documentGetListByStatusLambda } from "./lambdas";

interface ApiNodes {
    document: Resource;
    audit: Resource;
    verify: Resource;
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
        verify: version.addResource('verify'),
    }
    /* Documents endpoints */
    configureDocumentUploadEndpoint(apiGatewayInstance, apiNodesInstance.document, requestValidatorInstance);
    configureGetDocumentsListByStatusEndpoint(apiGatewayInstance, apiNodesInstance.document, requestValidatorInstance);
    configureGetDocumentsListByOwnerEndpoint(apiGatewayInstance, apiNodesInstance.document, requestValidatorInstance);
    configureGetDocumentDetailsEndpoint(apiGatewayInstance, apiNodesInstance.document, requestValidatorInstance);

   
    //
    //
    //
    /* Audit endpoints */
    //configureAuditGetEventsEndpoint(apiGatewayInstance, apiNodesInstance.audit, requestValidatorInstance);
    /* Verify endpoints */
    //configureVerifyUpdateTrailEndpoint(apiGatewayInstance, apiNodesInstance.verify, requestValidatorInstance);
}
function configureDocumentUploadEndpoint(apiGateway: RestApi, node: Resource, requestValidatorInstance: RequestValidator) {
    const modelName = ResourceName.apiGateway.DOCUMENTS_REQUEST_MODEL_DOCUMENT_UPLOAD;
    let requestModel = {
        contentType: "application/json",
        description: "Document upload API endpoint body validation",
        modelName: modelName,
        modelId: modelName,
        schema: {
            type: JsonSchemaType.OBJECT,
            properties: {
                initiatorSystemCode: { type: JsonSchemaType.STRING, enum: SupportedInitiatorSystemCodes },
                requestorId: { type: JsonSchemaType.STRING },
                files: {
                    type: JsonSchemaType.ARRAY,
                    items: {
                        type: JsonSchemaType.OBJECT,
                        properties: {
                            documentOwnerId: { type: JsonSchemaType.STRING },
                            documentFormat: { type: JsonSchemaType.STRING, enum: SupportedDocumentsFormats },
                            documentCategory: { type: JsonSchemaType.STRING, enum: SupportedDocumentsCategories },
                            documentSize: { type: JsonSchemaType.NUMBER , maximum: AllowedDocumentSize },
                        },
                        required: ["documentOwnerId", "documentFormat", "documentCategory", "documentSize"],
                    },
                }
            },
            required: ["initiatorSystemCode", "requestorId", "files"],
        },
    };
    apiGateway.addModel(modelName, requestModel);
    node.addResource("upload").addMethod('POST', 
        new LambdaIntegration((documentGeneratePreSignedUploadUrlsLambda())), {
        apiKeyRequired: true,
        requestModels: { "application/json": requestModel },
        requestValidator: requestValidatorInstance,
    })
}
function configureGetDocumentsListByStatusEndpoint(apiGateway: RestApi, node: Resource, requestValidatorInstance: RequestValidator) {
    const modelName = ResourceName.apiGateway.DOCUMENTS_REQUEST_MODEL_GET_LIST_STATUS;
    let requestModel = {
        contentType: "application/json",
        description: "Get list of documents by status",
        modelName: modelName,
        modelId: modelName,
        schema: {
            type: JsonSchemaType.OBJECT,
            properties: {
                initiatorSystemCode: { type: JsonSchemaType.STRING, enum: SupportedInitiatorSystemCodes },
                requestorId: { type: JsonSchemaType.STRING },
                documentStatus: { type: JsonSchemaType.STRING, enum: SupportedDocumentStatuses },
                documentType: { type: JsonSchemaType.STRING, enum: SupportedDocumentTypes  },
                documentOwnerId: { type: JsonSchemaType.STRING },
            },
            required: [ "initiatorSystemCode", "requestorId", "documentStatus", "documentOwnerId", "documentType"],
        },
    };
    apiGateway.addModel(modelName, requestModel);
    node.addResource('get-list-by-status').addMethod("POST", new LambdaIntegration(documentGetListByStatusLambda()), {
        apiKeyRequired: true,
        requestModels: { "application/json": requestModel },
        requestValidator: requestValidatorInstance,
    });
}
function configureGetDocumentsListByOwnerEndpoint(apiGateway: RestApi, node: Resource, requestValidatorInstance: RequestValidator) {
    const modelName = ResourceName.apiGateway.DOCUMENTS_REQUEST_MODEL_GET_LIST_OWNER;
    let requestModel = {
        contentType: "application/json",
        description: "Document: Get List by Owner ID",
        modelName: modelName,
        modelId: modelName,
        schema: {
            type: JsonSchemaType.OBJECT,
            properties: {
                initiatorSystemCode: { type: JsonSchemaType.STRING, enum: SupportedInitiatorSystemCodes },
                requestorId: { type: JsonSchemaType.STRING },
                documentType: { type: JsonSchemaType.STRING, enum: SupportedDocumentTypes  },
                documentOwnerId: { type: JsonSchemaType.STRING },
            },
            required: [ "initiatorSystemCode", "requestorId", "documentType", "documentOwnerId"],
        },
    };
    apiGateway.addModel(modelName, requestModel);
    node.addResource('get-list-by-owner').addMethod("POST", new LambdaIntegration(documentGetListByOwnerLambda()), {
        apiKeyRequired: true,
        requestModels: { "application/json": requestModel },
        requestValidator: requestValidatorInstance,
    });
}
function configureGetDocumentDetailsEndpoint(apiGateway: RestApi, node: Resource, requestValidatorInstance: RequestValidator) {
    const modelName = ResourceName.apiGateway.DOCUMENTS_REQUEST_MODEL_DOCUMENT_GET_DETAILS;
    let requestModel = {
        contentType: "application/json",
        description: "Request model: Get Document Details API endpoint",
        modelName: modelName,
        modelId: modelName,
        schema: {
            type: JsonSchemaType.OBJECT,
            properties: {
                initiatorSystemCode: { type: JsonSchemaType.STRING, enum: SupportedInitiatorSystemCodes },
                requestorId: { type: JsonSchemaType.STRING },
                documentType: { type: JsonSchemaType.STRING, enum: SupportedDocumentTypes  },
                documentId: { type: JsonSchemaType.STRING },
            },
            required: [ "initiatorSystemCode", "requestorId", "documentType", "documentId"],
        },
    };
    apiGateway.addModel(modelName, requestModel);
    node.addResource("get-details").addMethod('POST',
        StepFunctionsIntegration.startExecution(workflows.workflowGetDocumentDetails()), {
        apiKeyRequired: true,
        requestModels: { "application/json": requestModel },
        requestValidator: requestValidatorInstance,
    })
}




function configureVerifyUpdateTrailEndpoint(apiGateway: RestApi, node: Resource, requestValidatorInstance: RequestValidator) {
    const modelName = ResourceName.apiGateway.VERIFY_REQUEST_MODEL_UPDATE_TRAIL;
    let requestModel = {
        contentType: "application/json",
        description: "Verify workflow: Update process trail",
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
                documentId: {
                    type: JsonSchemaType.STRING
                },
                verificationStatus: {
                    type: JsonSchemaType.STRING
                },
                comment: {
                    type: JsonSchemaType.STRING
                },
            },
            required: [
               "initiatorSystemCode",
               "requestorId",
               "documentId",
               "verificationStatus"
            ],
        },
    };
    apiGateway.addModel(modelName, requestModel);
    node.addResource("update-trail").addMethod('POST',
        StepFunctionsIntegration.startExecution(workflows.workflowVerifyDocument()), {
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


