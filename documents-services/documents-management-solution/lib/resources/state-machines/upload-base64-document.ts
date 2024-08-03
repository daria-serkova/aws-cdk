import { Role } from "aws-cdk-lib/aws-iam";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { Choice, Condition, Fail, LogLevel, StateMachine, StateMachineType } from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";
import { ResourceName } from "../../resource-reference";
import { auditStoreEventLambda, documentValidateBase64Lambda, documentUploadBase64Lambda, documentUploadMetadataLambda } from "../lambdas";
import { addCloudWatchPutPolicy, addStateMachineExecutionPolicy, createStateMachineRole } from "../iam";
import { createLambdaInvokeTask } from "../../../helpers/utilities";

/**
 * Configuration of State Machine for 'Get Document Details' workflow
 * @param scope 
 */
export const configureWorkflow = (scope: Construct, apiGatewayRole: Role, logGroup: LogGroup): StateMachine => {
  const validateBase64DocumentTask = createLambdaInvokeTask(scope,
    ResourceName.stateMachines.WF_UPLOAD_B64_TASK_VALIDATE_BASE64_DOCUMENT, documentValidateBase64Lambda);
  const uploadBase64DocumentTask = createLambdaInvokeTask(scope,
    ResourceName.stateMachines.WF_UPLOAD_B64_TASK_ADD_BASE64_DOCUMENT, documentUploadBase64Lambda);
  const uploadDocumentMetadataTask = createLambdaInvokeTask(scope,
    ResourceName.stateMachines.WF_UPLOAD_B64_TASK_ADD_METADATA, documentUploadMetadataLambda);
  const storeAuditEventTask = createLambdaInvokeTask(scope, 
    ResourceName.stateMachines.WF_UPLOAD_B64_TASK_STORE_AUDIT_EVENT,
    auditStoreEventLambda)

  const stateMachineRole = createStateMachineRole(scope, ResourceName.iam.WORKFLOW_DOCUMENT_UPLOAD_BASE64);
  addCloudWatchPutPolicy(stateMachineRole, ResourceName.cloudWatch.DOCUMENT_WORKFLOW_LOGS_GROUP);

  const failState = new Fail(scope, ResourceName.stateMachines.WF_UPLOAD_B64_FAILED_STATE_VALIDATION, {
    errorPath: '$.body.message',
    causePath: '$.body.errors'
  });

  const definition = validateBase64DocumentTask
    .next(new Choice(scope, ResourceName.stateMachines.WF_UPLOAD_B64_CHOICE_IS_VALID)
      .when(Condition.numberEquals('$.statusCode', 200), 
        uploadBase64DocumentTask
          .next(uploadDocumentMetadataTask)
          .next(storeAuditEventTask)
      )
      .otherwise(failState)
    );

  const stateMachine = new StateMachine(scope, ResourceName.stateMachines.WORKFLOW_DOCUMENT_UPLOAD_BASE64, {
    stateMachineName: ResourceName.stateMachines.WORKFLOW_DOCUMENT_UPLOAD_BASE64,
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