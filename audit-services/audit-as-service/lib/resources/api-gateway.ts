import { Construct } from "constructs";
import { 
    Cors, 
    JsonSchemaType, 
    LambdaIntegration, 
    Period, 
    RequestValidator, 
    Resource, 
    RestApi, 
} from "aws-cdk-lib/aws-apigateway";
import { ResourceName } from "../resource-reference";
import { isProduction, SupportedAccountLockReasonsValues, SupportedAccountLockStatusesValues, SupportedEventTypesValues, SupportedInitiatorSystemCodesValues, SupportedLoginFailuresCodesValues, SupportedLoginMethodsValues, SupportedOtpMediumsValues, SupportedOtpPurposesValues, SupportedOtpValidationFailureCodesValues, SupportedParamsPatterns } from "../../helpers/utils";
import { auditStoreEventLambda } from "./lambdas";

interface ApiNodes {
    audit: Resource;
}
let apiNodesInstance: ApiNodes;

/**
 * Configuration of API Gateway
 * @param scope 
 */
export default function configureApiGatewayResources(scope: Construct ) {
    const apiGatewayInstance = new RestApi(scope, ResourceName.apiGateway.GATEWAY, {
        restApiName: ResourceName.apiGateway.GATEWAY,
        description: 'Audit As Service (AaaS) Solution API endpoints',
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
    const usageplan = apiGatewayInstance.addUsagePlan(ResourceName.apiGateway.USAGE_PLAN, {
        name: ResourceName.apiGateway.USAGE_PLAN,
        description:  "Usage plan used for Audit As Service Solution API",
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
    const apiKey = apiGatewayInstance.addApiKey(ResourceName.apiGateway.API_KEY, {
        apiKeyName: ResourceName.apiGateway.API_KEY,
        description: `API Key for Audit as a Service Solution API`,
    });
    usageplan.addApiKey(apiKey);
    
    const requestValidatorInstance = new RequestValidator(scope, 
        ResourceName.apiGateway.REQUEST_VALIDATOR, 
        {
            restApi: apiGatewayInstance,
            requestValidatorName: ResourceName.apiGateway.REQUEST_VALIDATOR,
            validateRequestBody: true,
            validateRequestParameters: false,
        }
    );
    const version = apiGatewayInstance.root.addResource('v1');
    apiNodesInstance = {
        audit: version.addResource('audit'),
    }
    auditStoreEventsEndpoint(apiGatewayInstance, apiNodesInstance.audit, requestValidatorInstance);
}

const auditStoreEventsEndpoint = (apiGateway: RestApi, node: Resource, requestValidatorInstance: RequestValidator) => {
    const modelName = ResourceName.apiGateway.REQUEST_MODEL_AUDIT_STORE;
    let requestModel = {
        contentType: "application/json",
        description: "Request Model: Store Audit Event",
        modelName: modelName,
        modelId: modelName,
        schema: {
            type: JsonSchemaType.OBJECT,
            properties: {
                initiatorsystemcode: { type: JsonSchemaType.STRING, enum: SupportedInitiatorSystemCodesValues },
                requestorid: { type: JsonSchemaType.STRING },
                requestorip: { type: JsonSchemaType.STRING, pattern: SupportedParamsPatterns.IP },
                eventtype: { type: JsonSchemaType.STRING, enum: SupportedEventTypesValues },
                timestamp: { type: JsonSchemaType.STRING, pattern: SupportedParamsPatterns.TIMESTAMP },
                
                devicetype: { type: JsonSchemaType.STRING },
                devicemodel: { type: JsonSchemaType.STRING },
                devicebrowsername: { type: JsonSchemaType.STRING },
                deviceosname: { type: JsonSchemaType.STRING },
                deviceosversion: { type: JsonSchemaType.STRING },

                otppurpose: { type: JsonSchemaType.STRING, enum: SupportedOtpPurposesValues },
                otpmedium: { type: JsonSchemaType.STRING, enum: SupportedOtpMediumsValues },
                otpexpirationtime: { type: JsonSchemaType.STRING, pattern: SupportedParamsPatterns.TIMESTAMP },
                otprecipient: { type: JsonSchemaType.STRING },
                otpvalidationfailurecode: { type: JsonSchemaType.STRING, enum: SupportedOtpValidationFailureCodesValues },
                relatedeventid: { type: JsonSchemaType.STRING }, // Audit event ID linking this event to the corresponding OTP_GENERATED event.
                
                loginmethod: { type: JsonSchemaType.STRING, enum: SupportedLoginMethodsValues },
                loginfailurecode: { type: JsonSchemaType.STRING, enum: SupportedLoginFailuresCodesValues },
                loginpreviousfailedattempts:  { type: JsonSchemaType.NUMBER },

                sessionid: { type: JsonSchemaType.STRING },
                sessionexpirationtime:  { type: JsonSchemaType.STRING, pattern: SupportedParamsPatterns.TIMESTAMP },
                sessionidold: { type: JsonSchemaType.STRING },
                sessionexpirationtimeold:  { type: JsonSchemaType.STRING, pattern: SupportedParamsPatterns.TIMESTAMP },
                sessionidnew: { type: JsonSchemaType.STRING },
                sessionexpirationtimenew:  { type: JsonSchemaType.STRING, pattern: SupportedParamsPatterns.TIMESTAMP },
            
                accountlockstatus: { type: JsonSchemaType.STRING, enum: SupportedAccountLockStatusesValues },
                accountlockduration: { type: JsonSchemaType.NUMBER },
                accountlockreason: { type: JsonSchemaType.STRING, enum: SupportedAccountLockReasonsValues }, 
                
            },
            required: ["initiatorsystemcode", "requestorid", "requestorip", "eventtype", "timestamp"],
            additionalProperties: false, // Restricts any other fields
        },
    };
    apiGateway.addModel(modelName, requestModel);
    node.addResource('store').addMethod("POST", new LambdaIntegration(auditStoreEventLambda()), {
        apiKeyRequired: true,
        requestModels: { "application/json": requestModel },
        requestValidator: requestValidatorInstance,
    });
}