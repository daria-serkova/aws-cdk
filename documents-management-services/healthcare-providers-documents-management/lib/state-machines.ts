import { LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import * as lambdas from "./lambdas";
import { Fail, Pass, StateMachine, Choice, Condition } from "aws-cdk-lib/aws-stepfunctions";
import { resourceName } from "../helpers/utilities";
import { AwsIntegration } from "aws-cdk-lib/aws-apigateway";
import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";

let uploadDocumentsStateMachineIntegrationInstance: AwsIntegration;
/**
 * Configuration of State Machine for 'Upload Documents' workflow
 * @param scope 
 */
export function configureUploadDocumentsWorkflowStateMachine(scope: Construct) {
    const uploadDocumentTask = new LambdaInvoke(scope, 'Upload document to S3 bucket', {
        lambdaFunction: lambdas.uploadLambda(),
        inputPath: '$',
        outputPath: '$.Payload',
    }).addCatch(new Fail(scope, 'Upload Failed'), {
        errors: ['States.ALL'],
        resultPath: '$.error-info',
    });

    const updateMetadataTask = new LambdaInvoke(scope, 'Save document metadata in DynamoDB', {
        lambdaFunction: lambdas.updateMetadataLambda(),
        inputPath: '$',
        outputPath: '$.Payload',
    }).addCatch(new Fail(scope, 'Metadata Update Failed'), {
        errors: ['States.ALL'],
        resultPath: '$.error-info',
    });

    const recordAuditEventTask = new LambdaInvoke(scope, 'Add Audit Record', {
        lambdaFunction: lambdas.sendAuditEventLambda(),
        inputPath: '$',
        outputPath: '$.Payload',
    }).addCatch(new Fail(scope, 'Audit Event Failed'), {
        errors: ['States.ALL'],
        resultPath: '$.error-info',
    });

    const sendEmailTask = new LambdaInvoke(scope, 'Send Email to administrator', {
        lambdaFunction: lambdas.sendEmailLambda(),
        inputPath: '$',
        outputPath: '$.Payload',
    }).addCatch(new Fail(scope, 'Email Send Failed'), {
        errors: ['States.ALL'],
        resultPath: '$.error-info',
    });

    // Add document validation task
    const validateDocumentTask = new LambdaInvoke(scope, 'Validate Document', {
        lambdaFunction: lambdas.validateDocumentLambda(),
        inputPath: '$',
        outputPath: '$.Payload',
    }).addCatch(new Fail(scope, 'Validation Failed'), {
        errors: ['States.ALL'],
        resultPath: '$.error-info',
    });

    // Success and failure states
    const success = new Pass(scope, 'Success');
    const failure = new Fail(scope, 'Failure');

    const iamRole = new Role(scope, resourceName('upload-document-sm-role'), {
        roleName: resourceName('upload-document-sm-role'),
        assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
      });
      iamRole.addToPolicy(new PolicyStatement({
        actions: ['states:StartExecution'],
        resources: ['*'], // Specify more restrictive ARNs as needed
    }));
    // Define the state machine
    const definition = validateDocumentTask
        .next(new Choice(scope, 'Is Document Valid?')
            .when(Condition.booleanEquals('$.isValid', true), uploadDocumentTask
                .next(updateMetadataTask)
                .next(recordAuditEventTask)
                .next(sendEmailTask)
                .next(success))
            .otherwise(failure)
        );
        const stateMachine = new StateMachine(scope, resourceName('upload-state-machine'), {
            stateMachineName: resourceName('upload-state-machine'),
            definition,
            role: iamRole,
        });
        uploadDocumentsStateMachineIntegrationInstance = new AwsIntegration({
            
            service: 'states',
            action: 'StartExecution',
            options: {
                credentialsRole: iamRole,
                integrationResponses: [{ statusCode: '200' }],
                requestTemplates: {
                    'application/json': JSON.stringify({
                        input: '$input.json("$")',
                        stateMachineArn: stateMachine.stateMachineArn
                    })
                },

            },
        });

    
}

export const uploadDocumentsStateMachineIntegration = () => uploadDocumentsStateMachineIntegrationInstance;
