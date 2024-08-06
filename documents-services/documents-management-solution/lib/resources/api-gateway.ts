import { Construct } from "constructs";
import { 
    Cors, 
    JsonSchemaType, 
    LambdaIntegration, 
    Period, 
    RequestValidator, 
    Resource, RestApi, 
    StepFunctionsIntegration 
} from "aws-cdk-lib/aws-apigateway";
import { ResourceName } from "../resource-reference";
import { isProduction } from "../../helpers/utilities";
import { 
    AllowedDocumentSize, 
    SupportedDocumentsCategories, 
    SupportedDocumentsFormats, 
    SupportedDocumentStatuses, 
    SupportedDocumentTypes, 
    SupportedEventCodes, 
    SupportedInitiatorSystemCodes, 
    SupportedRequestOperations,
     SupportedParamsPatterns, 
} from "../../functions/helpers/utilities";
import * as workflows from "./state-machines";
import { 
    auditGetEventsLambda, 
    documentGeneratePreSignedUploadUrlsLambda, 
    documentGetListByOwnerLambda, 
    documentGetListByStatusLambda 
} from "./lambdas";

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
    configureGetDocumentUrlEndpoint(apiGatewayInstance, apiNodesInstance.document, requestValidatorInstance);
    configureGetDocumentMetadataEndpoint(apiGatewayInstance, apiNodesInstance.document, requestValidatorInstance);
    /* Audit endpoints */
    configureAuditGetEventsEndpoint(apiGatewayInstance, apiNodesInstance.audit, requestValidatorInstance);
    /* Verify endpoints */
    configureVerifyUpdateTrailEndpoint(apiGatewayInstance, apiNodesInstance.verify, requestValidatorInstance);
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
                initiatorsystemcode: { type: JsonSchemaType.STRING, enum: SupportedInitiatorSystemCodes },
                requestorid: { type: JsonSchemaType.STRING },
                files: {
                    type: JsonSchemaType.ARRAY,
                    items: {
                        type: JsonSchemaType.OBJECT,
                        properties: {
                            documentownerid: { type: JsonSchemaType.STRING },
                            documentformat: { type: JsonSchemaType.STRING, enum: SupportedDocumentsFormats },
                            documentcategory: { type: JsonSchemaType.STRING, enum: SupportedDocumentsCategories },
                            documentsize: { type: JsonSchemaType.NUMBER , maximum: AllowedDocumentSize },
                        },
                        required: ["documentownerid", "documentformat", "documentcategory", "documentsize"],
                    },
                }
            },
            required: ["initiatorsystemcode", "requestorid", "files"],
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
                initiatorsystemcode: { type: JsonSchemaType.STRING, enum: SupportedInitiatorSystemCodes },
                requestorid: { type: JsonSchemaType.STRING },
                documentstatus: { type: JsonSchemaType.STRING, enum: SupportedDocumentStatuses },
                documenttype: { type: JsonSchemaType.STRING, enum: SupportedDocumentTypes  },
                documentownerid: { type: JsonSchemaType.STRING },
            },
            required: [ "initiatorsystemcode", "requestorid", "documentstatus", "documentownerid", "documenttype"],
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
                initiatorsystemcode: { type: JsonSchemaType.STRING, enum: SupportedInitiatorSystemCodes },
                requestorid: { type: JsonSchemaType.STRING },
                documenttype: { type: JsonSchemaType.STRING, enum: SupportedDocumentTypes  },
                documentownerid: { type: JsonSchemaType.STRING },
            },
            required: [ "initiatorsystemcode", "requestorid", "documenttype", "documentownerid"],
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
                initiatorsystemcode: { type: JsonSchemaType.STRING, enum: SupportedInitiatorSystemCodes },
                requestorid: { type: JsonSchemaType.STRING },
                requestorip: { type: JsonSchemaType.STRING, pattern: SupportedParamsPatterns.IP },
                documenttype: { type: JsonSchemaType.STRING, enum: SupportedDocumentTypes  },
                documentid: { type: JsonSchemaType.STRING },
            },
            required: [ 'initiatorsystemcode', 'requestorid', 'documenttype', 'requestorip', 'documentid'],
        },
    };
    apiGateway.addModel(modelName, requestModel);
    node.addResource("get-document").addMethod('POST',
        StepFunctionsIntegration.startExecution(workflows.workflowGetDocumentDetails()), {
        apiKeyRequired: true,
        requestModels: { "application/json": requestModel },
        requestValidator: requestValidatorInstance,
    })
}
function configureGetDocumentUrlEndpoint(apiGateway: RestApi, node: Resource, requestValidatorInstance: RequestValidator) {
    const modelName = ResourceName.apiGateway.DOCUMENTS_REQUEST_MODEL_DOCUMENT_GET_URL;
    let requestModel = {
        contentType: "application/json",
        description: "Request model: Get Document Url API endpoint",
        modelName: modelName,
        modelId: modelName,
        schema: {
            type: JsonSchemaType.OBJECT,
            properties: {
                initiatorsystemcode: { type: JsonSchemaType.STRING, enum: SupportedInitiatorSystemCodes },
                requestorid: { type: JsonSchemaType.STRING },
                requestorip: { type: JsonSchemaType.STRING, pattern: SupportedParamsPatterns.IP },
                documenttype: { type: JsonSchemaType.STRING, enum: SupportedDocumentTypes  },
                documentid: { type: JsonSchemaType.STRING },
            },
            required: [ 'initiatorsystemcode', 'requestorid', 'documenttype', 'requestorip', 'documentid'],
        },
    };
    apiGateway.addModel(modelName, requestModel);
    node.addResource("get-url").addMethod('POST',
        StepFunctionsIntegration.startExecution(workflows.workflowGetDocumentUrl()), {
        apiKeyRequired: true,
        requestModels: { "application/json": requestModel },
        requestValidator: requestValidatorInstance,
    })
}
function configureGetDocumentMetadataEndpoint(apiGateway: RestApi, node: Resource, requestValidatorInstance: RequestValidator) {
    const modelName = ResourceName.apiGateway.DOCUMENTS_REQUEST_MODEL_DOCUMENT_GET_METADATA;
    let requestModel = {
        contentType: "application/json",
        description: "Request model: Get Document Url API endpoint",
        modelName: modelName,
        modelId: modelName,
        schema: {
            type: JsonSchemaType.OBJECT,
            properties: {
                initiatorsystemcode: { type: JsonSchemaType.STRING, enum: SupportedInitiatorSystemCodes },
                requestorid: { type: JsonSchemaType.STRING },
                requestorip: { type: JsonSchemaType.STRING, pattern: SupportedParamsPatterns.IP },
                documenttype: { type: JsonSchemaType.STRING, enum: SupportedDocumentTypes  },
                documentid: { type: JsonSchemaType.STRING },
            },
            required: [ 'initiatorsystemcode', 'requestorid', 'documenttype', 'requestorip', 'documentid'],
        },
    };
    apiGateway.addModel(modelName, requestModel);
    node.addResource("get-metadata").addMethod('POST',
        StepFunctionsIntegration.startExecution(workflows.workflowGetDocumentMetadata()), {
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
                initiatorsystemcode: { type: JsonSchemaType.STRING, enum: SupportedInitiatorSystemCodes },
                requestorid: { type: JsonSchemaType.STRING },
                requestorip: { type: JsonSchemaType.STRING, pattern: SupportedParamsPatterns.IP },
                documenttype: { type: JsonSchemaType.STRING, enum: SupportedDocumentTypes  },
                documentid: { type: JsonSchemaType.STRING },
                verificationstatus: { type: JsonSchemaType.STRING, enum: SupportedDocumentStatuses },
            },
            required: [ 'initiatorsystemcode', 'requestorid', 'documenttype', 'requestorip', 'documentid', 'verificationstatus'],
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
                initiatorsystemcode: { type: JsonSchemaType.STRING, enum: SupportedInitiatorSystemCodes },
                requestorid: { type: JsonSchemaType.STRING },
                requestorip: { type: JsonSchemaType.STRING, pattern: SupportedParamsPatterns.IP },
                documenttype: { type: JsonSchemaType.STRING, enum: SupportedDocumentTypes  },
                operationtype: { type: JsonSchemaType.STRING, enum: SupportedRequestOperations },
                documentid: { type: JsonSchemaType.STRING },
                eventinitiator: { type: JsonSchemaType.STRING },
                eventaction: { type: JsonSchemaType.STRING,  enum: SupportedEventCodes || ['*']},
            },
            required: ["initiatorsystemcode", "requestorid", "requestorip", "documenttype", "operationtype"],
        },
    };
    apiGateway.addModel(modelName, requestModel);
    node.addResource('get-events').addMethod("POST", new LambdaIntegration(auditGetEventsLambda()), {
        apiKeyRequired: true,
        requestModels: { "application/json": requestModel },
        requestValidator: requestValidatorInstance,
    });
}


