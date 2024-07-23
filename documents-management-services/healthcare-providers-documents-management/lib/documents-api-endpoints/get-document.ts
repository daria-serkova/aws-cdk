import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { Policy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { JsonSchemaType, LambdaIntegration, Resource } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { resolve, dirname } from 'path';
import { ApiResources, LogsResources } from '../../helpers/types';
import { 
    AWS_REQUETS_MODELS_NAMING_CONVENTION, 
    AWS_RESOURCES_NAMING_CONVENTION, 
    REGION, 
    VALIDATION_RULES 
} from '../../helpers/utilities';
import { getDocumentLambda } from '../lambda-functions/documents/lambda-instances';

const resourcesNames = {
    lambda:  AWS_RESOURCES_NAMING_CONVENTION.replace('$', 'get-document'),
    iamRole: AWS_RESOURCES_NAMING_CONVENTION.replace('$', 'get-document-role'),
    iamPolicy: AWS_RESOURCES_NAMING_CONVENTION.replace('$', 'get-document-policy'),
    apiEndpoint: 'get-document',
    apiRequestModel: `${AWS_REQUETS_MODELS_NAMING_CONVENTION}GetDocument`
};
export default function getDocumentAction(
    scope: Construct, 
    lambdasFolder: string, 
    logs: LogsResources,
    api: ApiResources,
    apiNode: Resource
) {
    const iamRole = new Role(scope, resourcesNames.iamRole, {
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
        roleName: resourcesNames.iamRole,
    });
    iamRole.attachInlinePolicy(
        new Policy(scope, resourcesNames.iamPolicy, {
            policyName: resourcesNames.iamPolicy,
            statements: [logs.policy],
        })
    );
    const lambda = getDocumentLambda(scope, lambdasFolder);
    const requestModel = {
        contentType: "application/json",
        description: `Validates parameters for Get Document API endpoint`,
        modelName: resourcesNames.apiRequestModel,
        modelId: resourcesNames.apiRequestModel,
        schema: {
            type: JsonSchemaType.OBJECT,
            properties: {
                ip: {
                    type: JsonSchemaType.STRING,
                    pattern: VALIDATION_RULES.PATTERN_IP,
                },
            },
            required: ["ip"],
        },
    };
    api.apiGateway.addModel(requestModel.modelName, requestModel);
    const action = apiNode.addResource(resourcesNames.apiEndpoint);
    action.addMethod("POST", new LambdaIntegration(lambda), {
        apiKeyRequired: true,
        requestModels: { "application/json": requestModel },
        requestValidator: api.requestValidator,
    });
}