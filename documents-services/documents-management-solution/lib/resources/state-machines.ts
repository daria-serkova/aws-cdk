import { LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import * as lambdas from "./lambdas";

import { AwsIntegration } from "aws-cdk-lib/aws-apigateway";
import { addStateMachineExecutionPolicy, createApiGatewayRole, createStateMachineRole } from "./iam";
import { ResourceName } from "../resource-reference";
import { Fail, Parallel, Pass, StateMachine, TaskInput } from "aws-cdk-lib/aws-stepfunctions";

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
    }).addCatch(new Fail(scope, 'Upload Failed'), {
        errors: ['States.ALL'],
        resultPath: '$.error',
    });
    const uploadMetadataTask = new LambdaInvoke(scope, 'Upload Metadata', {
        lambdaFunction: lambdas.documentUploadMetadataLambda(),
        inputPath: '$.body.metadata',
        outputPath: '$.Payload',
    }).addCatch(new Fail(scope, 'Metadata Upload Failed'), {
        errors: ['States.ALL'],
        resultPath: '$.error',
    });
    const uploadAuditTask = new LambdaInvoke(scope, 'Store Audit Record', {
        lambdaFunction: lambdas.storeAuditEventLambda(),
        inputPath: '$.body.audit',
        outputPath: '$.Payload',
    }).addCatch(new Fail(scope, 'Audit Upload Failed'), {
        errors: ['States.ALL'],
        resultPath: '$.error',
    });
    
     // Create IAM Role for Step Functions
   const stateMachineRole = createStateMachineRole(scope, ResourceName.iam.DOCUMENT_UPLOAD_BASE64_STATE_MANCHINE);

   const parallelTasks = new Parallel(scope, 'Parallel Tasks')
    .branch(uploadMetadataTask)
    .branch(uploadAuditTask)
    .addCatch(new Fail(scope, 'Parallel Tasks Failed'), {
        errors: ['States.ALL'],
        resultPath: '$.error',
    });

    // Define the state machine definition
    const definition = uploadDocumentTask
        .next(parallelTasks)
        .next(new Pass(scope, 'Success'));
        
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