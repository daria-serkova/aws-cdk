import { Role } from "aws-cdk-lib/aws-iam";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { LogLevel, StateMachine, StateMachineType } from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";
import { ResourceName } from "../../resource-reference";
import { documentGetMetadataLambda } from "../lambdas";
import { addCloudWatchPutPolicy, addStateMachineExecutionPolicy, createStateMachineRole } from "../iam";
import { createLambdaInvokeTask } from "../../../helpers/utilities";

/**
 * Configuration of State Machine for 'Get Document Metadata' workflow
 * @param scope 
 */
export const configureWorkflow = (scope: Construct, apiGatewayRole: Role, logGroup: LogGroup): StateMachine => {
  const getDocumentMetadataTask = createLambdaInvokeTask(scope,
      ResourceName.stateMachines.WF_GET_METADATA_TASK_RETRIEVE_META,
      documentGetMetadataLambda);

  const stateMachineRole = createStateMachineRole(scope, ResourceName.iam.WORKFLOW_DOCUMENT_GET_METADATA);
  addCloudWatchPutPolicy(stateMachineRole, ResourceName.cloudWatch.DOCUMENT_WORKFLOW_LOGS_GROUP);

  const definition = getDocumentMetadataTask;

  const stateMachine = new StateMachine(scope, ResourceName.stateMachines.WORKFLOW_DOCUMENT_GET_META, {
    stateMachineName: ResourceName.stateMachines.WORKFLOW_DOCUMENT_GET_META,
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
