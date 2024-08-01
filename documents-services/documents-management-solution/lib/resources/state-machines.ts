import { LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import * as lambdas from "./lambdas";

import { AwsIntegration } from "aws-cdk-lib/aws-apigateway";
import { addStateMachineExecutionPolicy, createApiGatewayRole, createStateMachineRole } from "./iam";
import { ResourceName } from "../resource-reference";
import { Fail, JsonPath, Parallel, Pass, StateMachine } from "aws-cdk-lib/aws-stepfunctions";
import { Role } from "aws-cdk-lib/aws-iam";

let uploadDocumentBase64StateMachineIntegrationInstance: AwsIntegration;
let viewDocumentStateMachineIntegrationInstance: AwsIntegration;

export default function configureStateMachines (scope: Construct) {
    const apiGatewayRole = createApiGatewayRole(scope, ResourceName.iam.API_GATEWAY_ROLE);
    configureDocumentBase64UploadWorkflowStateMachine(scope, apiGatewayRole);
    configureDocumentViewWorkflowStateMachine(scope, apiGatewayRole);

}
/**
 * Configuration of State Machine for 'Upload Documents' workflow
 * @param scope 
 */
export function configureDocumentBase64UploadWorkflowStateMachine(scope: Construct, apiGatewayRole: Role) {
    // Define Step Function Tasks
    const uploadDocumentTask = new LambdaInvoke(scope, 'Upload Base64 Document', {
        lambdaFunction: lambdas.documentUploadBase64Lambda(),
        outputPath: '$.Payload.body',
    });
    const uploadMetadataTask = new LambdaInvoke(scope, 'Upload Base64 Document Metadata', {
        lambdaFunction: lambdas.documentUploadMetadataLambda(),
        inputPath: '$',
        outputPath: '$.Payload.body',
    });
    const uploadAuditTask = new LambdaInvoke(scope, 'Store Document Upload Audit Record', {
        lambdaFunction: lambdas.storeAuditEventLambda(),
        inputPath: '$',
        outputPath: '$.Payload.body',
    });
    const sendNotifications = new LambdaInvoke(scope, 'Send notification to user', {
      lambdaFunction: lambdas.documentSendNotificationsLambda(),
      inputPath: '$',
      outputPath: '$.Payload.body',
    });
    
     // Create IAM Role for Step Functions
   const stateMachineRole = createStateMachineRole(scope, ResourceName.iam.DOCUMENT_UPLOAD_BASE64_STATE_MANCHINE);

    // Define the state machine definition
    const definition = uploadDocumentTask
        .next(uploadMetadataTask)
        .next(uploadAuditTask)
        .next(sendNotifications)
        
    const stateMachine = new StateMachine(scope, ResourceName.stateMachines.DOCUMENT_UPLOAD_BASE64_STATE_MANCHINE, {
        stateMachineName:  ResourceName.stateMachines.DOCUMENT_UPLOAD_BASE64_STATE_MANCHINE,
        definition,
        role: stateMachineRole,
    });
    addStateMachineExecutionPolicy(apiGatewayRole, stateMachine.stateMachineArn);
    uploadDocumentBase64StateMachineIntegrationInstance = new AwsIntegration({
      service: 'states',
      action: 'StartExecution',
      options: {
          credentialsRole: apiGatewayRole,
          integrationResponses: [{
            statusCode: '200',
            responseTemplates: {
              'application/json': JSON.stringify({
                documentId: "$input.path('$.documentId')",
            }),
            },
        }],
          requestTemplates: {
              'application/json': JSON.stringify({
                  input: "$util.escapeJavaScript($input.body).replace('\"', '\"')",
                  stateMachineArn: stateMachine.stateMachineArn
              }),
          },
      },
  });
}
/**
 * Configuration of State Machine for 'Upload Documents' workflow
 * @param scope 
 */
 export function configureDocumentViewWorkflowStateMachine(scope: Construct, apiGatewayRole: Role) {
    
     // Create IAM Role for Step Functions
   const stateMachineRole = createStateMachineRole(scope, ResourceName.iam.DOCUMENT_VIEW_STATE_MANCHINE);

   const generatePresignedUrlTask = new LambdaInvoke(scope, 'Generate Pre-Signed URL', {
    lambdaFunction: lambdas.documentViewLambda(),
    outputPath: '$.Payload',
  }).addCatch(new Fail(scope, 'Generate Pre-Signed URL Failed'), {
    errors: ['States.ALL'],
    resultPath: '$.error',
  });

  const storeAuditEventTask = new LambdaInvoke(scope, 'Store View Audit Event', {
    lambdaFunction: lambdas.storeAuditEventLambda(),
    inputPath: '$.audit',
    outputPath: '$.Payload',
  }).addCatch(new Fail(scope, 'Store View Audit Event Failed'), {
    errors: ['States.ALL'],
    resultPath: '$.error',
  });

  // Pass URL to API Gateway
  const passUrlToApiGateway = new Pass(scope, 'Pass URL to API Gateway', {
    parameters: {
        'statusCode': 200,
        'body': {
          'url.$': '$.url', // Assuming 'url' is directly in the payload
        },
      },
  });

  const parallelTasks = new Parallel(scope, 'Parallel View Tasks')
    .branch(passUrlToApiGateway)
    .branch(storeAuditEventTask)
    .addCatch(new Fail(scope, 'Parallel View Tasks Failed'), {
        errors: ['States.ALL'],
        resultPath: '$.error',
    });

    // Define the state machine definition
    const definition = generatePresignedUrlTask
        .next(parallelTasks)
        .next(new Pass(scope, 'View Success'));
  
    const stateMachine = new StateMachine(scope, ResourceName.stateMachines. DOCUMENT_VIEW_STATE_MANCHINE, {
        stateMachineName:  ResourceName.stateMachines. DOCUMENT_VIEW_STATE_MANCHINE,
        definition,
        role: stateMachineRole,
    });
    addStateMachineExecutionPolicy(apiGatewayRole, stateMachine.stateMachineArn);
    viewDocumentStateMachineIntegrationInstance = new AwsIntegration({
        service: 'states',
        action: 'StartExecution',
        options: {
          credentialsRole: apiGatewayRole,
          integrationResponses: [{
            statusCode: '200',
            responseTemplates: {
              'application/json': JSON.stringify({
                statusCode: 200,
                body: {
                    message: 'Test'
                  //url: "$input.path('$.apiGatewayResponse.body.url')", // Match the result path
                },
              }),
            },
          }],
          requestTemplates: {
            'application/json': JSON.stringify({
              input: "$util.escapeJavaScript($input.body).replace('\"', '\"')",
              stateMachineArn: stateMachine.stateMachineArn,
            }),
          },
        },
      });
}
export const uploadDocumentBase64StateMachineIntegration = () => uploadDocumentBase64StateMachineIntegrationInstance;
export const viewDocumentStateMachineIntegration = () => viewDocumentStateMachineIntegrationInstance;
