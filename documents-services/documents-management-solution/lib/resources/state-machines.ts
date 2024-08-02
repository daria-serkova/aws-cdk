import { LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import * as lambdas from "./lambdas";
import { addCloudWatchPutPolicy, addStateMachineExecutionPolicy, createApiGatewayRole, createStateMachineRole } from "./iam";
import { ResourceName } from "../resource-reference";
import { Choice, Condition, Fail, LogLevel, StateMachine, StateMachineType, TaskStateBase } from "aws-cdk-lib/aws-stepfunctions";
import { Role } from "aws-cdk-lib/aws-iam";
import { Duration } from "aws-cdk-lib";
import { LogGroup } from "aws-cdk-lib/aws-logs";

let workflowDocumentUploadBase64Instance: StateMachine;
export const workflowDocumentUploadBase64 = () => workflowDocumentUploadBase64Instance;

export default function configureStateMachines (scope: Construct, logGroup: LogGroup) {
    const apiGatewayRole = createApiGatewayRole(scope, ResourceName.iam.API_GATEWAY_ROLE);
    const errorsHandlingTask = new LambdaInvoke(scope, ResourceName.stateMachines.TASK_ERRORS_HANDLING_TASK, {
      lambdaFunction: lambdas.errorsHandlingLambda(),
      outputPath: '$.Payload',
    });

    const validateBase64DocumentTask = new LambdaInvoke(scope, ResourceName.stateMachines.TASK_VALIDATE_BASE64_DOCUMENT, {
      lambdaFunction: lambdas.documentValidateBase64Lambda(),
      outputPath: '$.Payload'
    });
    
    const uploadBase64DocumentTask = new LambdaInvoke(scope, ResourceName.stateMachines.TASK_UPLOAD_BASE64_DOCUMENT, {
      lambdaFunction: lambdas.documentUploadBase64Lambda(),
      outputPath: '$.Payload',
    })//.addRetry({ maxAttempts: 3, interval: Duration.seconds(10), backoffRate: 2 })
      //.addCatch(errorsHandlingTask, { resultPath: '$.error-info' });
    
    const uploadDocumentMetadataTask = new LambdaInvoke(scope, ResourceName.stateMachines.TASK_UPLOAD_DOCUMENT_METADATA, {
      lambdaFunction: lambdas.documentUploadMetadataLambda(),
      outputPath: '$.Payload',
    })//.addRetry({ maxAttempts: 3, interval: Duration.seconds(10), backoffRate: 2 })
      //.addCatch(errorsHandlingTask, { resultPath: '$.error-info' });
    
    const storeAuditEventTask = new LambdaInvoke(scope, ResourceName.stateMachines.TASK_STORE_AUDIT_EVENT, {
      lambdaFunction: lambdas.auditStoreEventLambda(),
      outputPath: '$.Payload',
    })//.addRetry({ maxAttempts: 3, interval: Duration.seconds(10), backoffRate: 2 })
      //.addCatch(errorsHandlingTask, { resultPath: '$.error-info' });

    

    workflowDocumentUploadBase64Instance = configureWorkflowDocumentUploadBase64(
      scope,
      apiGatewayRole,  
      logGroup, 
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
const configureWorkflowDocumentUploadBase64 = (scope: Construct, apiGatewayRole: Role, logGroup: LogGroup, ...tasks: TaskStateBase[]): StateMachine => {
  const [ 
    validateBase64DocumentTask,
    uploadBase64DocumentTask,
    uploadDocumentMetadataTask,
    storeAuditEventTask
  ] = tasks;

  const stateMachineRole = createStateMachineRole(scope, ResourceName.iam.WORKFLOW_DOCUMENT_UPLOAD_BASE64);
  addCloudWatchPutPolicy(stateMachineRole, ResourceName.cloudWatch.DOCUMENT_WORKFLOW_LOGS_GROUP);
  const failState = new Fail(scope, ResourceName.stateMachines.FAILED_STATE_DOCUMENT_UPLOAD_VALIDATION, {
    errorPath: '$.body.message',
    causePath: '$.body.errors'
  });
  const definition = validateBase64DocumentTask
  .next(new Choice(scope, 'IsValidDocument')
    .when(Condition.numberEquals('$.statusCode', 200), 
      uploadBase64DocumentTask
        .next(uploadDocumentMetadataTask)
        .next(storeAuditEventTask)
    )
    .otherwise(failState)
  );
    const stateMachine = new StateMachine(scope, ResourceName.stateMachines.WORKFLOW_DOCUMENT_UPLOAD_BASE64, {
      stateMachineName:  ResourceName.stateMachines.WORKFLOW_DOCUMENT_UPLOAD_BASE64,
      stateMachineType: StateMachineType.EXPRESS,
      definition,
      role: stateMachineRole,
      logs: {
        destination: logGroup,
        level: LogLevel.ALL,
        //includeExecutionData: true,
      },
    });
  addStateMachineExecutionPolicy(apiGatewayRole, stateMachine.stateMachineArn);
  return stateMachine;
}