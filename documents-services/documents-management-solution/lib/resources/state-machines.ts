import { LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import * as lambdas from "./lambdas";

import { AwsIntegration } from "aws-cdk-lib/aws-apigateway";
import { addStateMachineExecutionPolicy, createApiGatewayRole, createStateMachineRole } from "./iam";
import { ResourceName } from "../resource-reference";
import { StateMachine, TaskStateBase } from "aws-cdk-lib/aws-stepfunctions";
import { Role } from "aws-cdk-lib/aws-iam";
import { Duration } from "aws-cdk-lib";

let workflowDocumentUploadBase64Instance: AwsIntegration;
export const workflowDocumentUploadBase64 = () => workflowDocumentUploadBase64Instance;

export default function configureStateMachines (scope: Construct) {
    const apiGatewayRole = createApiGatewayRole(scope, ResourceName.iam.API_GATEWAY_ROLE);
    const errorsHandlingTask = new LambdaInvoke(scope, ResourceName.stateMachines.TASK_ERRORS_HANDLING_TASK, {
      lambdaFunction: lambdas.errorsHandlingLambda(),
      outputPath: '$.Payload.body',
    });

    const validateBase64DocumentTask = new LambdaInvoke(scope, ResourceName.stateMachines.TASK_VALIDATE_BASE64_DOCUMENT, {
      lambdaFunction: lambdas.documentValidateBase64Lambda(),
      outputPath: '$.Payload.body',
    }).addRetry({ maxAttempts: 3, interval: Duration.seconds(10), backoffRate: 2 })
      .addCatch(errorsHandlingTask, { resultPath: '$.error-info' });
    
    const uploadBase64DocumentTask = new LambdaInvoke(scope, ResourceName.stateMachines.TASK_UPLOAD_BASE64_DOCUMENT, {
      lambdaFunction: lambdas.documentUploadBase64Lambda(),
      outputPath: '$.Payload.body',
    }).addRetry({ maxAttempts: 3, interval: Duration.seconds(10), backoffRate: 2 })
      .addCatch(errorsHandlingTask, { resultPath: '$.error-info' });
    
    const uploadDocumentMetadataTask = new LambdaInvoke(scope, ResourceName.stateMachines.TASK_UPLOAD_DOCUMENT_METADATA, {
      lambdaFunction: lambdas.documentUploadBase64Lambda(),
      outputPath: '$.Payload.body',
    }).addRetry({ maxAttempts: 3, interval: Duration.seconds(10), backoffRate: 2 })
      .addCatch(errorsHandlingTask, { resultPath: '$.error-info' });
    
    const storeAuditEventTask = new LambdaInvoke(scope, ResourceName.stateMachines.TASK_STORE_AUDIT_EVENT, {
      lambdaFunction: lambdas.documentUploadBase64Lambda(),
      outputPath: '$.Payload.body',
    }).addRetry({ maxAttempts: 3, interval: Duration.seconds(10), backoffRate: 2 })
      .addCatch(errorsHandlingTask, { resultPath: '$.error-info' });

    workflowDocumentUploadBase64Instance = configureWorkflowDocumentUploadBase64(
      scope, 
      apiGatewayRole, 
      validateBase64DocumentTask,
      uploadBase64DocumentTask,
      uploadDocumentMetadataTask,
      storeAuditEventTask
  );
}
/**
 * Configuration of State Machine for 'Upload Base 64 Document' workflow
 * @param scope 
 */
const configureWorkflowDocumentUploadBase64 = (scope: Construct, apiGatewayRole: Role, ...tasks: TaskStateBase[]): AwsIntegration => {
  const [ 
    validateBase64DocumentTask,
    uploadBase64DocumentTask,
    uploadDocumentMetadataTask,
    storeAuditEventTask,
    errorsHandlingTask 
  ] = tasks;

  const stateMachineRole = createStateMachineRole(scope, ResourceName.iam.WORKFLOW_DOCUMENT_UPLOAD_BASE64);
  const definition = validateBase64DocumentTask
    .next(uploadBase64DocumentTask)
    .next(uploadDocumentMetadataTask)
    .next(storeAuditEventTask);  
  const stateMachine = new StateMachine(scope, ResourceName.stateMachines.WORKFLOW_DOCUMENT_UPLOAD_BASE64, {
    stateMachineName:  ResourceName.stateMachines.WORKFLOW_DOCUMENT_UPLOAD_BASE64,
    definition,
    role: stateMachineRole,
  });
  addStateMachineExecutionPolicy(apiGatewayRole, stateMachine.stateMachineArn);
    return new AwsIntegration({
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