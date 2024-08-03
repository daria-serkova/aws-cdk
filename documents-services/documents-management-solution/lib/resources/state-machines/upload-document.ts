import { Role } from "aws-cdk-lib/aws-iam";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { Choice, Condition, Fail, LogLevel, StateMachine, StateMachineType } from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";
import { ResourceName } from "../../resource-reference";
import { auditStoreEventLambda, documentValidateBase64Lambda, documentUploadBase64Lambda, documentUploadMetadataLambda } from "../lambdas";
import { addCloudWatchPutPolicy, addStateMachineExecutionPolicy, createStateMachineRole } from "../iam";
import { createLambdaInvokeTask } from "../../../helpers/utilities";

/**
 * Configuration of State Machine for 'Upload Document through Pre-Signed URL' workflow
 * @param scope 
 */
export const configureWorkflow = (scope: Construct, apiGatewayRole: Role, logGroup: LogGroup): StateMachine => {
  const validateDocumentParamsTask = createLambdaInvokeTask(scope,
      ResourceName.stateMachines.WF_UPLOAD_TASK_VALIDATE_DOCUMENT_DATA,
      documentValidateBase64Lambda);
  const generatePreSignedUploadUrl = createLambdaInvokeTask(scope,
      ResourceName.stateMachines.WF_UPLOAD_TASK_GENERATE_PRESIGNED_URL,
      documentUploadBase64Lambda);
  const storeAuditEventTask = createLambdaInvokeTask(scope, 
      ResourceName.stateMachines.WF_UPLOAD_TASK_STORE_AUDIT_EVENT,
      auditStoreEventLambda);

  const stateMachineRole = createStateMachineRole(scope, ResourceName.iam.WORKFLOW_DOCUMENT_UPLOAD);
  addCloudWatchPutPolicy(stateMachineRole, ResourceName.cloudWatch.DOCUMENT_WORKFLOW_LOGS_GROUP);

  const failState = new Fail(scope, ResourceName.stateMachines.WF_UPLOAD_FAILED_STATE_VALIDATION, {
    errorPath: '$.body.message',
    causePath: '$.body.errors'
  });

  const definition = validateDocumentParamsTask
    .next(new Choice(scope, ResourceName.stateMachines.WF_UPLOAD_CHOICE_IS_VALID)
      .when(Condition.numberEquals('$.statusCode', 200), 
      generatePreSignedUploadUrl
          .next(storeAuditEventTask)
      )
      .otherwise(failState)
    );

  const stateMachine = new StateMachine(scope, ResourceName.stateMachines.WORKFLOW_DOCUMENT_UPLOAD, {
    stateMachineName: ResourceName.stateMachines.WORKFLOW_DOCUMENT_UPLOAD,
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