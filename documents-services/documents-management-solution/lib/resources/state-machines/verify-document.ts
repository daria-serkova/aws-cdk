import { Role } from "aws-cdk-lib/aws-iam";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { LogLevel, StateMachine, StateMachineType } from "aws-cdk-lib/aws-stepfunctions";
import { LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import { ResourceName } from "../../resource-reference";
import { verifyUpdateTrailLambda, documentUploadMetadataLambda, auditStoreEventLambda } from "../lambdas";
import { addCloudWatchPutPolicy, addStateMachineExecutionPolicy, createStateMachineRole } from "../iam";

/**
 * Creates a LambdaInvoke task.
 * @param scope 
 * @param id 
 * @param lambdaFunction 
 */
const createLambdaInvokeTask = (scope: Construct, id: string, lambdaFunction: () => any): LambdaInvoke => (
  new LambdaInvoke(scope, id, {
    lambdaFunction: lambdaFunction(),
    outputPath: '$.Payload',
  })
);

/**
 * Configuration of State Machine for 'Verify Document' workflow
 * @param scope 
 */
export const configureWorkflow = (scope: Construct, apiGatewayRole: Role, logGroup: LogGroup): StateMachine => {
  const stateMachineRole = createStateMachineRole(scope, ResourceName.iam.WORKFLOW_VERIFY);
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

  const stateMachine = new StateMachine(scope, ResourceName.stateMachines.WORKFLOW_VERIFY, {
    stateMachineName: ResourceName.stateMachines.WORKFLOW_VERIFY,
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