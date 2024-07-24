import { LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import * as lambdas from "./lambdas";
import { Fail, Pass, StateMachine, Choice, Condition } from "aws-cdk-lib/aws-stepfunctions";
import { resourceName } from "../helpers/utilities";
import { AwsIntegration } from "aws-cdk-lib/aws-apigateway";
import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { addStepFunctionExecutionPolicy, addStepFunctionExecutionPolicyForAllResources, createApiGatewayRole, createLambdaRole, createStepFunctionRole } from "./iam";

let uploadDocumentsStateMachineIntegrationInstance: AwsIntegration;
/**
 * Configuration of State Machine for 'Upload Documents' workflow
 * @param scope 
 */
export function configureUploadDocumentsWorkflowStateMachine(scope: Construct) {
    const validateDocumentTask = new LambdaInvoke(scope, 'Validate Document', {
        lambdaFunction: lambdas.validateDocumentLambda(),
        inputPath: '$',
        outputPath: '$.Payload',
    }).addCatch(new Fail(scope, 'Validation Failed'), {
        errors: ['States.ALL'],
        resultPath: '$.error',
    });
    const uploadDocumentTask = new LambdaInvoke(scope, 'Upload document to S3 bucket', {
        lambdaFunction: lambdas.uploadLambda(),
        inputPath: '$.document',
        outputPath: '$.Payload',
    }).addCatch(new Fail(scope, 'Upload Failed'), {
        errors: ['States.ALL'],
        resultPath: '$.error',
    });
    const recordAuditEventTask = new LambdaInvoke(scope, 'Add Audit Record', {
        lambdaFunction: lambdas.sendAuditEventLambda(),
        inputPath: '$.auditData',
        outputPath: '$.Payload',
    }).addCatch(new Fail(scope, 'Audit Event Failed'), {
        errors: ['States.ALL'],
        resultPath: '$.error',
    });
    const sendEmailTask = new LambdaInvoke(scope, 'Send Email to administrator', {
        lambdaFunction: lambdas.sendEmailLambda(),
        inputPath: '$.email',
        outputPath: '$.Payload',
    }).addCatch(new Fail(scope, 'Email Send Failed'), {
        errors: ['States.ALL'],
        resultPath: '$.error',
    });
    const success = new Pass(scope, 'Success');

   const stateMachineRole = createStepFunctionRole(scope, 'upload-document-sm-role');
   addStepFunctionExecutionPolicyForAllResources(stateMachineRole);
    const definition = validateDocumentTask
        .next(uploadDocumentTask)
        .next(recordAuditEventTask)
        //.next(sendEmailTask)
        .next(success);

    const stateMachine = new StateMachine(scope, resourceName('upload-document-workflow'), {
        stateMachineName: resourceName('upload-document-workflow'),
        definition,
        role: stateMachineRole,
    });

    // Create IAM Role for API Gateway to invoke Step Functions
    const apiGatewayRole = createApiGatewayRole(scope, 'upload-document-ag-role');
    addStepFunctionExecutionPolicy(stateMachineRole, stateMachine);
    uploadDocumentsStateMachineIntegrationInstance = new AwsIntegration({
        service: 'states',
        action: 'StartExecution',
        options: {
            credentialsRole: apiGatewayRole,
            integrationResponses: [{ statusCode: '200' }],
            requestTemplates: {
                'application/json': JSON.stringify({
                  input: "$util.escapeJavaScript($input.body).replace('\"', '\"')",
                  stateMachineArn: stateMachine.stateMachineArn
                }),
            },
        },
    });
}
export const uploadDocumentsStateMachineIntegration = () => uploadDocumentsStateMachineIntegrationInstance;
