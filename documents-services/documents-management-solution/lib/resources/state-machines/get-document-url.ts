import { Role } from "aws-cdk-lib/aws-iam";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { LogLevel, StateMachine, StateMachineType } from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";
import { ResourceName } from "../../resource-reference";
import { auditStoreEventLambda, documentGeneratePreSignedLambda } from "../lambdas";
import { addCloudWatchPutPolicy, addStateMachineExecutionPolicy, createStateMachineRole } from "../iam";
import { createLambdaInvokeTask } from "../../../helpers/utilities";

/**
 * Configuration of State Machine for 'Get Document Details' workflow
 * @param scope 
 */
export const configureWorkflow = (scope: Construct, apiGatewayRole: Role, logGroup: LogGroup): StateMachine => {
  const generateDocumentPreSignedUrlTask = createLambdaInvokeTask(scope,
      ResourceName.stateMachines.WF_GET_URL_TASK_GENERATE_URL,
      documentGeneratePreSignedLambda);
  const storeViewAuditEventTask = createLambdaInvokeTask(scope, 
      ResourceName.stateMachines.WF_GET_URL_TASK_STORE_AUDIT_EVENT,
      auditStoreEventLambda);

  const stateMachineRole = createStateMachineRole(scope, ResourceName.iam.WORKFLOW_DOCUMENT_GET_URL);
  addCloudWatchPutPolicy(stateMachineRole, ResourceName.cloudWatch.DOCUMENT_WORKFLOW_LOGS_GROUP);

  const definition = generateDocumentPreSignedUrlTask
    .next(storeViewAuditEventTask)

  const stateMachine = new StateMachine(scope, ResourceName.stateMachines.WORKFLOW_DOCUMENT_GET_URL, {
    stateMachineName: ResourceName.stateMachines.WORKFLOW_DOCUMENT_GET_URL,
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
