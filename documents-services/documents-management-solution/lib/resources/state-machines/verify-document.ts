import { Role } from "aws-cdk-lib/aws-iam";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { LogLevel, StateMachine, StateMachineType } from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";
import { ResourceName } from "../../resource-reference";
import { verifyUpdateTrailLambda, auditStoreEventLambda, documentUploadMetadataLambda, documentGetMetadataLambda } from "../lambdas";
import { addCloudWatchPutPolicy, addStateMachineExecutionPolicy, createStateMachineRole } from "../iam";
import { createLambdaInvokeTask } from "../../../helpers/utilities";

/**
 * Configuration of State Machine for 'Verify Document' workflow
 * @param scope 
 */
export const configureWorkflow = (scope: Construct, apiGatewayRole: Role, logGroup: LogGroup): StateMachine => {
  const stateMachineRole = createStateMachineRole(scope, ResourceName.iam.WORKFLOW_VERIFY_DOCUMENT);
  addCloudWatchPutPolicy(stateMachineRole, ResourceName.cloudWatch.DOCUMENT_WORKFLOW_LOGS_GROUP);
  
  const getDocumentMetadataTask = createLambdaInvokeTask(scope, 
    ResourceName.stateMachines.WF_VERIFY_TASK_GET_METADATA, 
    documentGetMetadataLambda);
  const storeVerificationTrailTask = createLambdaInvokeTask(scope, 
    ResourceName.stateMachines.WF_VERIFY_TASK_UPDATE_TRAIL, 
    verifyUpdateTrailLambda);
  const updateDocumentMetadataTask = createLambdaInvokeTask(scope, 
    ResourceName.stateMachines.WF_VERIFY_TASK_UPDATE_METADATA, 
    documentUploadMetadataLambda);
  const storeViewAuditEventTask = createLambdaInvokeTask(scope, 
    ResourceName.stateMachines.WF_VERIFY_TASK_STORE_AUDIT_EVENT,
    auditStoreEventLambda);

  const definition = getDocumentMetadataTask
    .next(storeVerificationTrailTask)
    .next(updateDocumentMetadataTask)
    .next(storeViewAuditEventTask);

  const stateMachine = new StateMachine(scope, ResourceName.stateMachines.WORKFLOW_VERIFY_DOCUMENT, {
    stateMachineName: ResourceName.stateMachines.WORKFLOW_VERIFY_DOCUMENT,
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