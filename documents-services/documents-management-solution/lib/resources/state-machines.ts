import { LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import * as lambdas from "./lambdas";

import { AwsIntegration } from "aws-cdk-lib/aws-apigateway";
import { addStateMachineExecutionPolicy, createApiGatewayRole, createStateMachineRole } from "./iam";
import { ResourceName } from "../resource-reference";
import { StateMachine } from "aws-cdk-lib/aws-stepfunctions";

let uploadDocumentBase64StateMachineIntegrationInstance: AwsIntegration;
/**
 * Configuration of State Machine for 'Upload Documents' workflow
 * @param scope 
 */
export function configureDocumentBase64UploadWorkflowStateMachine(scope: Construct) {
    // Define Step Function Tasks
    const uploadDocumentTask = new LambdaInvoke(scope, 'Upload 64Base Document', {
        lambdaFunction: lambdas.documentUploadBase64Lambda(),
        outputPath: '$.Payload',
    });

    const uploadMetadataTask = new LambdaInvoke(scope, 'Upload Metadata', {
        lambdaFunction: lambdas.documentUploadMetadataLambda(),
        inputPath: '$.Payload',
        outputPath: '$.Payload',
    });
     // Create IAM Role for Step Functions
   const stateMachineRole = createStateMachineRole(scope, ResourceName.iam.DOCUMENT_UPLOAD_BASE64_STATE_MANCHINE);


    const definition = uploadDocumentTask
        .next(uploadMetadataTask);
        
    const stateMachine = new StateMachine(scope, ResourceName.stateMachines.DOCUMENT_UPLOAD_BASE64_STATE_MANCHINE, {
        stateMachineName:  ResourceName.stateMachines.DOCUMENT_UPLOAD_BASE64_STATE_MANCHINE,
        definition,
        role: stateMachineRole,
    });
   
   
    // Create IAM Role for API Gateway to invoke Step Functions
    const apiGatewayRole = createApiGatewayRole(scope, ResourceName.iam.API_GATEWAY_ROLE);
    addStateMachineExecutionPolicy(apiGatewayRole, stateMachine.stateMachineArn);
    uploadDocumentBase64StateMachineIntegrationInstance = new AwsIntegration({
        service: 'states',
        action: 'StartExecution',
        options: {
            credentialsRole: apiGatewayRole,
            integrationResponses: [{ statusCode: '200' }],
            requestTemplates: {
                'application/json': JSON.stringify({
                  input: "$util.escapeJavaScript($input.body).replace('\"', '\"')",
                  stateMachineArn: stateMachine.stateMachineArn
                }),
            },
        },
    });
}
export const uploadDocumentBase64StateMachineIntegration = () => uploadDocumentBase64StateMachineIntegrationInstance;