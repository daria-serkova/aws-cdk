
import { Construct } from "constructs";
import { Cors, JsonSchemaType, LambdaIntegration, Period, RequestValidator, Resource, RestApi } from "aws-cdk-lib/aws-apigateway";
import { ResourceName } from "../resource-reference";
import { isProduction } from "../../helpers/utilities";
import { documentUploadBase64Lambda } from "./lambdas";
import { supportedCategories, supportedFormats } from "../../functions/helpers/utilities";

interface ApiNodes {
    document: Resource;
}
let apiNodesInstance: ApiNodes;

/**
 * Configuration of API Gateway
 * @param scope 
 */
export function configureApiGatewayResources(scope: Construct ) {
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
    }
    configureDocumentUploadBase64Endpoint(apiGatewayInstance, apiNodesInstance.document, requestValidatorInstance);
}

// API Gateway has payload size limits (10 MB). 
// Large files may exceed these limits after base64 encoding. In this scenarios use pre-signed url.
function configureDocumentUploadBase64Endpoint(apiGateway: RestApi, node: Resource, requestValidatorInstance: RequestValidator) {
    const modelName = ResourceName.apiGateway.DOCUMENTS_SERVCIE_REQUEST_MODEL_DOCUMENT_UPLOAD_BASE64;
    const formats = supportedFormats;
    let requestModel = {
        contentType: "application/json",
        description: "Document base64 upload API endpoint body validation",
        modelName: modelName,
        modelId: modelName,
        schema: {
            type: JsonSchemaType.OBJECT,
            properties: {
                documentOwnerId: {
                    type: JsonSchemaType.STRING,
                },
                documentName: {
                    type: JsonSchemaType.STRING,
                },
                documentFormat: {
                    type: JsonSchemaType.STRING,
                    enum: formats
                },
                documentCategory: {
                    type: JsonSchemaType.STRING,
                    enum: supportedCategories,
                    
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
                initiatorSystemCode: {
                    type: JsonSchemaType.STRING
                },
            },
            required: [
                "documentOwnerId", 
                "documentName",
                "documentFormat", 
                "documentCategory", 
                "documentSize",
                "documentContent",
                "initiatorSystemCode"
            ],
        },
    };
    apiGateway.addModel(modelName, requestModel);
    node.addResource('upload-base64').addMethod("POST", new LambdaIntegration(documentUploadBase64Lambda()), {
        apiKeyRequired: true,
        requestModels: { "application/json": requestModel },
        requestValidator: requestValidatorInstance,
    });
}