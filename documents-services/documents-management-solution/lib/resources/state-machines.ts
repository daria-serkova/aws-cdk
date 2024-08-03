import { Construct } from "constructs";
import { createApiGatewayRole } from "./iam";
import { ResourceName } from "../resource-reference";
import { StateMachine } from "aws-cdk-lib/aws-stepfunctions";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import * as verifyDocument from './state-machines/verify-document';
import * as getDocumentDetails from './state-machines/get-document-details';
import * as uploadBase64Document from './state-machines/upload-base64-document';

let workflowDocumentUploadBase64Instance: StateMachine;
export const workflowDocumentUploadBase64 = () => workflowDocumentUploadBase64Instance;


let workflowGetDocumentDetailsInstance: StateMachine;
export const workflowGetDocumentDetails = () => workflowGetDocumentDetailsInstance;
let workflowVerifyDocumentInstance: StateMachine;
export const workflowVerifyDocument = () => workflowVerifyDocumentInstance;

/**
 * Configures and initializes the state machines for the application.
 * @param scope The scope within which the state machines are defined.
 * @param logGroup The log group to be used for logging state machine executions.
 */
export default function configureStateMachines(scope: Construct, logGroup: LogGroup) {
    // Create a role for API Gateway
    const apiGatewayRole = createApiGatewayRole(scope, ResourceName.iam.API_GATEWAY_ROLE);

    // Configure and initialize the 'Upload Base64 Document' state machine
    workflowDocumentUploadBase64Instance = uploadBase64Document.configureWorkflow(scope, apiGatewayRole, logGroup);

    // Configure and initialize the 'Get Document Details' state machine
    workflowGetDocumentDetailsInstance = getDocumentDetails.configureWorkflow(scope, apiGatewayRole, logGroup);

    // Configure and initialize the 'Verify Document' state machine
    workflowVerifyDocumentInstance = verifyDocument.configureWorkflow(scope, apiGatewayRole, logGroup);
}
