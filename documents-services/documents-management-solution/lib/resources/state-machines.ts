import { LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import * as lambdas from "./lambdas";
import { addCloudWatchPutPolicy, addStateMachineExecutionPolicy, createApiGatewayRole, createStateMachineRole } from "./iam";
import { ResourceName } from "../resource-reference";
import { Choice, Condition, Fail, JsonPath, LogLevel, StateMachine, StateMachineType, TaskInput, TaskStateBase } from "aws-cdk-lib/aws-stepfunctions";
import { Role } from "aws-cdk-lib/aws-iam";
import { Duration } from "aws-cdk-lib";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { EventCodes } from "../../helpers/utilities";

let workflowDocumentUploadBase64Instance: StateMachine;
export const workflowDocumentUploadBase64 = () => workflowDocumentUploadBase64Instance;
let workflowGetDocumentDetailsInstance: StateMachine;
export const workflowGetDocumentDetails = () => workflowGetDocumentDetailsInstance;

export default function configureStateMachines (scope: Construct, logGroup: LogGroup) {
    const apiGatewayRole = createApiGatewayRole(scope, ResourceName.iam.API_GATEWAY_ROLE);
    workflowDocumentUploadBase64Instance = configureWorkflowDocumentUploadBase64(scope, apiGatewayRole, logGroup);
    workflowGetDocumentDetailsInstance = configureWorkflowGetDocumentDetails(scope, apiGatewayRole, logGroup);
}
/**
 * Configuration of State Machine for 'Upload Base 64 Document' workflow
 * @param scope 
 */
const configureWorkflowDocumentUploadBase64 = (scope: Construct, apiGatewayRole: Role, logGroup: LogGroup): StateMachine => {
  const validateBase64DocumentTask = new LambdaInvoke(scope, ResourceName.stateMachines.WF_UPLOAD_TASK_VALIDATE_BASE64_DOCUMENT, {
    lambdaFunction: lambdas.documentValidateBase64Lambda(),
    outputPath: '$.Payload'
  });
  const uploadBase64DocumentTask = new LambdaInvoke(scope, ResourceName.stateMachines.WF_UPLOAD_TASK_ADD_BASE64_DOCUMENT, {
    lambdaFunction: lambdas.documentUploadBase64Lambda(),
    outputPath: '$.Payload',
  })//.addRetry({ maxAttempts: 3, interval: Duration.seconds(10), backoffRate: 2 })
    //.addCatch(errorsHandlingTask, { resultPath: '$.error-info' });
  
  const uploadDocumentMetadataTask = new LambdaInvoke(scope, ResourceName.stateMachines.WF_UPLOAD_TASK_ADD_METADATA, {
    lambdaFunction: lambdas.documentUploadMetadataLambda(),
    outputPath: '$.Payload',
  })//.addRetry({ maxAttempts: 3, interval: Duration.seconds(10), backoffRate: 2 })
    //.addCatch(errorsHandlingTask, { resultPath: '$.error-info' });
  
  const storeAuditEventTask = new LambdaInvoke(scope, ResourceName.stateMachines.WF_UPLOAD_TASK_STORE_AUDIT_EVENT, {
    lambdaFunction: lambdas.auditStoreEventLambda(),
    inputPath: '$',
    payload: TaskInput.fromObject({
      action: EventCodes.UPLOAD,
      body: JsonPath.stringAt('$.body')
    }),
    outputPath: '$.Payload',
  })//.addRetry({ maxAttempts: 3, interval: Duration.seconds(10), backoffRate: 2 })
    //.addCatch(errorsHandlingTask, { resultPath: '$.error-info' });

  const stateMachineRole = createStateMachineRole(scope, ResourceName.iam.WORKFLOW_DOCUMENT_UPLOAD_BASE64);
  addCloudWatchPutPolicy(stateMachineRole, ResourceName.cloudWatch.DOCUMENT_WORKFLOW_LOGS_GROUP);
  const failState = new Fail(scope, ResourceName.stateMachines.WF_UPLOAD_FAILED_STATE_BASE64_VALIDATION, {
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

/**
 * Configuration of State Machine for 'Get Document Details' workflow
 * @param scope 
 */
const configureWorkflowGetDocumentDetails = (scope: Construct, apiGatewayRole: Role, logGroup: LogGroup): StateMachine => {
  const getDocumentMetadataTask = new LambdaInvoke(scope, ResourceName.stateMachines.WF_GET_DETAILS_TASK_GET_METADATA, {
    lambdaFunction: lambdas.documentGetMetadataLambda(),
    outputPath: '$.Payload',
  })//.addRetry({ maxAttempts: 3, interval: Duration.seconds(10), backoffRate: 2 })
    //.addCatch(errorsHandlingTask, { resultPath: '$.error-info' });
  const generateDocumentPreSignedUrlTask = new LambdaInvoke(scope, ResourceName.stateMachines.WF_GET_DETAILS_TASK_GET_URL, {
    lambdaFunction: lambdas.documentGeneratePreSignedLambda(),
    outputPath: '$.Payload',
  })//.addRetry({ maxAttempts: 3, interval: Duration.seconds(10), backoffRate: 2 })
    //.addCatch(errorsHandlingTask, { resultPath: '$.error-info' });
  
  const storeAuditEventTask = new LambdaInvoke(scope, ResourceName.stateMachines.WF_GET_DETAILS_TASK_STORE_AUDIT_EVENT, {
    lambdaFunction: lambdas.auditStoreEventLambda(),
    inputPath: '$',
    payload: TaskInput.fromObject({
      action: EventCodes.VIEW,
      body: JsonPath.stringAt('$.body')
    }),
    outputPath: '$.Payload',
  })//.addRetry({ maxAttempts: 3, interval: Duration.seconds(10), backoffRate: 2 })
    //.addCatch(errorsHandlingTask, { resultPath: '$.error-info' });
  const stateMachineRole = createStateMachineRole(scope, ResourceName.iam.WORKFLOW_DOCUMENT_GET_DETAILS);
  addCloudWatchPutPolicy(stateMachineRole, ResourceName.cloudWatch.DOCUMENT_WORKFLOW_LOGS_GROUP);
  const definition = getDocumentMetadataTask
        .next(generateDocumentPreSignedUrlTask)
        .next(storeAuditEventTask)
    const stateMachine = new StateMachine(scope, ResourceName.stateMachines.WORKFLOW_DOCUMENT_GET_DETAILS, {
      stateMachineName:  ResourceName.stateMachines.WORKFLOW_DOCUMENT_GET_DETAILS,
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