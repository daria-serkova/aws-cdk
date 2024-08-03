import { Role } from "aws-cdk-lib/aws-iam";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { JsonPath, LogLevel, StateMachine, StateMachineType, TaskInput } from "aws-cdk-lib/aws-stepfunctions";
import { LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import { ResourceName } from "../../resource-reference";
import { auditStoreEventLambda, documentGetMetadataLambda, documentGeneratePreSignedLambda } from "../lambdas";
import { addCloudWatchPutPolicy, addStateMachineExecutionPolicy, createStateMachineRole } from "../iam";
import { createLambdaInvokeTask, EventCodes } from "../../../helpers/utilities";

/**
 * Configuration of State Machine for 'Get Document Details' workflow
 * @param scope 
 */
export const configureWorkflow = (scope: Construct, apiGatewayRole: Role, logGroup: LogGroup): StateMachine => {
  const getDocumentMetadataTask = createLambdaInvokeTask(scope, ResourceName.stateMachines.WF_GET_DETAILS_TASK_GET_METADATA, documentGetMetadataLambda);
  const generateDocumentPreSignedUrlTask = createLambdaInvokeTask(scope, ResourceName.stateMachines.WF_GET_DETAILS_TASK_GET_URL, documentGeneratePreSignedLambda);
  
  // const storeAuditEventTask = createLambdaInvokeTask(scope, ResourceName.stateMachines.WF_GET_DETAILS_TASK_STORE_AUDIT_EVENT, auditStoreEventLambda, {
  //   inputPath: '$',
  //   payload: TaskInput.fromObject({
  //     action: EventCodes.VIEW,
  //     body: JsonPath.stringAt('$.body')
  //   })
  // });
  const storeAuditEventTask = createLambdaInvokeTask(scope, 
    ResourceName.stateMachines.WF_GET_DETAILS_TASK_STORE_AUDIT_EVENT,
    auditStoreEventLambda)

  const stateMachineRole = createStateMachineRole(scope, ResourceName.iam.WORKFLOW_DOCUMENT_GET_DETAILS);
  addCloudWatchPutPolicy(stateMachineRole, ResourceName.cloudWatch.DOCUMENT_WORKFLOW_LOGS_GROUP);

  const definition = getDocumentMetadataTask
    .next(generateDocumentPreSignedUrlTask)
    .next(storeAuditEventTask);

  const stateMachine = new StateMachine(scope, ResourceName.stateMachines.WORKFLOW_DOCUMENT_GET_DETAILS, {
    stateMachineName: ResourceName.stateMachines.WORKFLOW_DOCUMENT_GET_DETAILS,
    stateMachineType: StateMachineType.EXPRESS,
    definition,
    role: stateMachineRole,
    logs: {
      destination: logGroup,
      level: LogLevel.ALL,
    },
  });

  addStateMachineExecutionPolicy(apiGatewayRole, stateMachine.stateMachineArn);

  return stateMachine;
};
