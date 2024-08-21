import { Construct } from 'constructs';
import { 
    Cors, 
    JsonSchemaType, 
    LambdaIntegration, 
    Period, 
    RequestValidator, 
    Resource, RestApi, 
    StepFunctionsIntegration 
} from 'aws-cdk-lib/aws-apigateway';
import { ResourceName } from '../resource-reference';
import { isProduction } from '../../helpers/utilities';
import { 
    AllowedDocumentSize, 
    SupportedDocumentsCategories, 
    SupportedDocumentsFormats, 
    SupportedDocumentStatuses, 
    SupportedDocumentTypes,
    SupportedInitiatorSystemCodes,
    SupportedParamsPatterns 
} from '../../helpers/utilities';
import * as workflows from './state-machines';
import { 
    documentGeneratePreSignedUploadUrlsLambda, 
    documentGetListByOwnerLambda, 
    documentGetListByStatusLambda 
} from './lambdas';

const apiVersion = 'v1';
interface ApiNodes {
    document: Resource;
    verify: Resource;
}
/**
 * Function creates and configure API Gateway resources.
 * @param scope 
 */
export default function configureApiGatewayResources(scope: Construct) {
    const apiGatewayInstance = new RestApi(scope, ResourceName.apiGateway.DOCUMENTS_SERVCIE_GATEWAY, {
        restApiName: ResourceName.apiGateway.DOCUMENTS_SERVCIE_GATEWAY,
        description: 'Documents Management Solution: API Layer',
        deployOptions: {
            stageName: isProduction ? 'prod' : 'dev',
            tracingEnabled: true,
        },
        defaultCorsPreflightOptions: {
            allowOrigins: Cors.ALL_ORIGINS,
            allowMethods: ['POST'],
        },
    });

    const usagePlan = apiGatewayInstance.addUsagePlan(ResourceName.apiGateway.DOCUMENTS_SERVCIE_API_USAGE_PLAN, {
        name: ResourceName.apiGateway.DOCUMENTS_SERVCIE_API_USAGE_PLAN,
        description: 'Documents Management Solution: Usage plan',
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

    const apiKey = apiGatewayInstance.addApiKey(ResourceName.apiGateway.DOCUMENTS_SERVCIE_API_KEY, {
        apiKeyName: ResourceName.apiGateway.DOCUMENTS_SERVCIE_API_KEY,
        description: 'Documents Management Solution: API Key',
    });
    usagePlan.addApiKey(apiKey);

    const requestValidatorInstance = new RequestValidator(scope, 
        ResourceName.apiGateway.DOCUMENTS_SERVCIE_API_REQUEST_VALIDATOR, {
            restApi: apiGatewayInstance,
            requestValidatorName: ResourceName.apiGateway.DOCUMENTS_SERVCIE_API_REQUEST_VALIDATOR,
            validateRequestBody: true,
            validateRequestParameters: false,
        }
    );
    const version = apiGatewayInstance.root.addResource(apiVersion);
    const apiNodes: ApiNodes = {
        document: version.addResource('document'),
        verify: version.addResource('verify'),
    };

    configureEndpoint(apiNodes.document, 'upload', documentGeneratePreSignedUploadUrlsLambda, createUploadRequestModel(), requestValidatorInstance, false);
    configureEndpoint(apiNodes.document, 'get-list-by-status', documentGetListByStatusLambda, createStatusRequestModel(), requestValidatorInstance, false);
    configureEndpoint(apiNodes.document, 'get-list-by-owner', documentGetListByOwnerLambda, createOwnerRequestModel(), requestValidatorInstance, false);
    configureEndpoint(apiNodes.document, 'get-document', workflows.workflowGetDocumentDetails, createDetailsRequestModel(), requestValidatorInstance, true);
    configureEndpoint(apiNodes.document, 'get-url', workflows.workflowGetDocumentUrl, createUrlRequestModel(), requestValidatorInstance, true);
    configureEndpoint(apiNodes.document, 'get-metadata', workflows.workflowGetDocumentMetadata, createMetadataRequestModel(), requestValidatorInstance, true);
    configureEndpoint(apiNodes.verify, 'update-trail', workflows.workflowVerifyDocument, createTrailRequestModel(), requestValidatorInstance, true);
}

/**
 * Configures an API Gateway endpoint for a given resource.
 * 
 * @param {Resource} node - The API Gateway resource node where the endpoint will be added.
 * @param {string} resourceName - The name of the resource (path) to be added under the node.
 * @param {any} handler - The handler function (Lambda or Step Functions) to be invoked by the endpoint.
 * @param {any} requestModel - The request model to be used for validating the request body.
 * @param {RequestValidator} validator - The request validator that will be used to validate the incoming request.
 * @param {boolean} [isStepFunction=false] - Flag indicating whether the handler is a Step Functions state machine (true) or a Lambda function (false). Defaults to false.
 * 
 * This function adds a POST method to the specified API Gateway resource. If the `isStepFunction` flag is true, it integrates with AWS Step Functions by starting an execution using the provided handler. If false, it integrates with a Lambda function. The method is secured with an API key and validates incoming requests using the provided request model and validator.
 */

function configureEndpoint(node: Resource, resourceName: string, handler: any, requestModel: any, validator: RequestValidator, isStepFunction: boolean) {
    const method = isStepFunction ? StepFunctionsIntegration.startExecution(handler()) : new LambdaIntegration(handler());
    node.addResource(resourceName).addMethod('POST', method, {
        apiKeyRequired: true,
        requestModels: { 'application/json': requestModel },
        requestValidator: validator,
    });
}

/**
 * Generates a JSON schema model that defines the structure and validation rules for the body of the Document Upload API endpoint.
 */
function createUploadRequestModel() {
    return createRequestModel('Documents Management Solution: Request Model - Document Upload API', {
        initiatorsystemcode: createStringProperty(SupportedInitiatorSystemCodes),
        requestorid: createStringProperty(),
        files: {
            type: JsonSchemaType.ARRAY,
            items: {
                type: JsonSchemaType.OBJECT,
                properties: {
                    documentownerid: createStringProperty(),
                    documentformat: createStringProperty(SupportedDocumentsFormats),
                    documentcategory: createStringProperty(SupportedDocumentsCategories),
                    documentsize: { type: JsonSchemaType.NUMBER, maximum: AllowedDocumentSize },
                },
                required: ['documentownerid', 'documentformat', 'documentcategory', 'documentsize'],
            },
        },
    }, ['initiatorsystemcode', 'requestorid', 'files']);
}
/**
 * Generates a JSON schema model that defines the structure and validation rules for the body of the Get Documents List by Status API endpoint.
 */
function createStatusRequestModel() {
    return createRequestModel('Documents Management Solution: Request Model - Get Documents List by Status API', {
        initiatorsystemcode: createStringProperty(SupportedInitiatorSystemCodes),
        requestorid: createStringProperty(),
        documentstatus: createStringProperty(SupportedDocumentStatuses),
        documenttype: createStringProperty(SupportedDocumentTypes),
        documentownerid: createStringProperty(),
    }, ['initiatorsystemcode', 'requestorid', 'documentstatus', 'documentownerid', 'documenttype']);
}
/**
 * Generates a JSON schema model that defines the structure and validation rules for the body of the Get Documents List by Owner API endpoint.
 */
function createOwnerRequestModel() {
    return createRequestModel('Documents Management Solution: Request Model - Get Documents List by Owner API', {
        initiatorsystemcode: createStringProperty(SupportedInitiatorSystemCodes),
        requestorid: createStringProperty(),
        documenttype: createStringProperty(SupportedDocumentTypes),
        documentownerid: createStringProperty(),
    }, ['initiatorsystemcode', 'requestorid', 'documenttype', 'documentownerid']);
}
/**
 * Generates a JSON schema model that defines the structure and validation rules for the body of the Get Document Details API endpoint.
 */
function createDetailsRequestModel() {
    return createRequestModel('Documents Management Solution: Request Model - Get Document Details API', {
        initiatorsystemcode: createStringProperty(SupportedInitiatorSystemCodes),
        requestorid: createStringProperty(),
        requestorip: createStringProperty(undefined, SupportedParamsPatterns.IP),
        documenttype: createStringProperty(SupportedDocumentTypes),
        documentid: createStringProperty(),
    }, ['initiatorsystemcode', 'requestorid', 'documenttype', 'requestorip', 'documentid']);
}
/**
 * Generates a JSON schema model that defines the structure and validation rules for the body of the Get Document URL API endpoint.
 */
function createUrlRequestModel() {
    return createDetailsRequestModel();
}
/**
 * Generates a JSON schema model that defines the structure and validation rules for the body of the Get Document Metadata API endpoint.
 */
function createMetadataRequestModel() {
    return createDetailsRequestModel();
}
/**
 * Generates a JSON schema model that defines the structure and validation rules for the body of the Verify Document API endpoint.
 */
function createTrailRequestModel() {
    return createRequestModel('Documents Management Solution: Request Model - Verify Document API', {
        initiatorsystemcode: createStringProperty(SupportedInitiatorSystemCodes),
        requestorid: createStringProperty(),
        requestorip: createStringProperty(undefined, SupportedParamsPatterns.IP),
        documenttype: createStringProperty(SupportedDocumentTypes),
        documentid: createStringProperty(),
        verificationstatus: createStringProperty(SupportedDocumentStatuses),
    }, ['initiatorsystemcode', 'requestorid', 'documenttype', 'requestorip', 'documentid', 'verificationstatus']);
}

/**
 * Creates a request model for API Gateway to validate incoming request bodies. 
 * This model is typically used in API Gateway to ensure that incoming requests adhere to a predefined format and contain all necessary fields.
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
 * @param {string[]} [enumValues] - An optional array of string values that the property is allowed to take. If provided, the property will be restricted to these values.
 * @param {string} [pattern] - An optional regular expression pattern that the property value must match. If provided, the property value will be validated against this pattern.
 * 
 * This function is typically used to generate JSON schema definitions for string properties in an API Gateway request model. The returned property object can be used to enforce specific value constraints, such as restricting values to a predefined set of strings or ensuring that the string matches a particular format.
 */

function createStringProperty(enumValues?: string[], pattern?: string) {
    const property: any = { type: JsonSchemaType.STRING };
    if (enumValues) property.enum = enumValues;
    if (pattern) property.pattern = pattern;
    return property;
}