import { Role } from "aws-cdk-lib/aws-iam";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { LogLevel, StateMachine, StateMachineType } from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";
import { ResourceName } from "../../resource-reference";
import { verifyUpdateTrailLambda, auditStoreEventLambda, documentUploadMetadataLambda } from "../lambdas";
import { addCloudWatchPutPolicy, addStateMachineExecutionPolicy, createStateMachineRole } from "../iam";
import { createLambdaInvokeTask } from "../../../helpers/utilities";

/**
 * Configuration of State Machine for 'Verify Document' workflow
 * @param scope 
 */
export const configureWorkflow = (scope: Construct, apiGatewayRole: Role, logGroup: LogGroup): StateMachine => {
  const stateMachineRole = createStateMachineRole(scope, ResourceName.iam.WORKFLOW_VERIFY_DOCUMENT);
  addCloudWatchPutPolicy(stateMachineRole, ResourceName.cloudWatch.DOCUMENT_WORKFLOW_LOGS_GROUP);

  const definition = createLambdaInvokeTask(scope, 
      ResourceName.stateMachines.WF_VERIFY_TASK_UPDATE_TRAIL, 
      verifyUpdateTrailLambda)
    .next(createLambdaInvokeTask(scope, 
      ResourceName.stateMachines.WF_VERIFY_TASK_UPDATE_METADATA, 
      documentUploadMetadataLambda))
    .next(createLambdaInvokeTask(scope, 
      ResourceName.stateMachines.WF_VERIFY_TASK_STORE_AUDIT_EVENT,
      auditStoreEventLambda));

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