import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { resolve, dirname } from 'path';

import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { addCloudWatchGeneralPutPolicy, createLambdaRole } from './iam';
import { ResourceName } from '../resource-reference';

const lambdaFilesLocation = '../../functions';

/**
 * Lambdas, related to Audit functionality
 */
let auditStoreEventLambdaInstance: NodejsFunction;
export const auditStoreEventLambda = () => auditStoreEventLambdaInstance;

const defaultLambdaSettings = {
    memorySize: 256,
    timeout: Duration.minutes(3),
    handler: 'handler',
}
/**
 * Configuration of Lambda functions
 * @param scope 
 */
export default function configureLambdaResources(scope: Construct) {
    auditStoreEventLambdaInstance = configureAuditStoreEventLambda(scope);
}

/**
 * Configures an AWS Lambda function to upload audit events about changes, related to documents to a DynamoDB table.
 * This function creates an IAM role for the Lambda function, adds policies to allow
 * writing to CloudWatch logs and DynamoDB, and sets up the Lambda function with necessary configurations.
 *
 * @param {Construct} scope - The scope in which this resource is defined.
 * @param {LogGroup} logGroup - The CloudWatch log group for logging Lambda function activity.
 * 
 * @returns {NodejsFunction} - The configured NodejsFunction instance.
 *
 */
 const configureAuditStoreEventLambda = (scope: Construct): NodejsFunction => {
    const iamRole = createLambdaRole(scope, ResourceName.iam.AUDIT_STORE_LAMBDA);
    addCloudWatchGeneralPutPolicy(iamRole);
    const lambda = new NodejsFunction(scope, ResourceName.lambda.AUDIT_STORE_LAMBDA, {
        functionName: ResourceName.lambda.AUDIT_STORE_LAMBDA,
        description: 'Stores audit events in the DynamoDB',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/audit-store-event.ts`),
        role: iamRole,
        environment: {
            REGION: process.env.AWS_REGION || '',
            AWS_RESOURCES_NAME_PREFIX: process.env.AWS_RESOURCES_NAME_PREFIX || '',
            TAG_ENVIRONMENT: process.env.TAG_ENVIRONMENT || '',
        },
        ...defaultLambdaSettings
    });
    return lambda;   
}

/**
 * Configures an AWS Lambda function to get list of audit events.
 * This function creates an IAM role for the Lambda function, adds policies to allow
 * writing to CloudWatch logs and read from Audit DynamoDB, and sets up the Lambda function with necessary configurations.
 *
 * @param {Construct} scope - The scope in which this resource is defined.
 * @param {LogGroup} logGroup - The CloudWatch log group for logging Lambda function activity.
 * 
 * @returns {NodejsFunction} - The configured NodejsFunction instance.
 *
 */