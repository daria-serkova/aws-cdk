
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { resolve, dirname } from 'path';
import { 
    createLambdaRole,
    addCloudWatchPutPolicy,  
    addDynamoDbWritePolicy,  
    addS3WritePolicy,
    addDynamoDbReadPolicy,
    addS3ReadPolicy
} from './iam';
import { ResourceName } from '../resource-reference';
import { LogGroup } from 'aws-cdk-lib/aws-logs';

const lambdaFilesLocation = '../../functions';

let documentValidateBase64LambdaInstance: NodejsFunction;
let documentUploadBase64LambdaInstance: NodejsFunction;
let documentUploadMetadataLambdaInstance: NodejsFunction;
let auditStoreEventLambdaInstance: NodejsFunction;
let notificationsSendLambdaInstance: NodejsFunction;
let documentGeneratePreSignedLambdaInstance: NodejsFunction;
let errorsHandlingLambdaInstance: NodejsFunction;

export const documentValidateBase64Lambda = () => documentValidateBase64LambdaInstance;
export const documentUploadBase64Lambda = () => documentUploadBase64LambdaInstance;
export const documentUploadMetadataLambda = () => documentUploadMetadataLambdaInstance;
export const documentGeneratePreSignedLambda = () => documentGeneratePreSignedLambdaInstance;
export const auditStoreEventLambda = () => auditStoreEventLambdaInstance;
export const notificationsSendLambda = () => notificationsSendLambdaInstance;
export const errorsHandlingLambda = () => errorsHandlingLambdaInstance;

/**
 * Configuration of Lambda functions
 * @param scope 
 */
export default function configureLambdaResources(
        scope: Construct, 
        logGroups: { documentOperations: LogGroup }) {
    documentValidateBase64LambdaInstance = configureLambdaValidateBase64Document(scope, logGroups.documentOperations);
    documentUploadBase64LambdaInstance = configureLambdaUploadBase64Document(scope, logGroups.documentOperations);
    documentUploadMetadataLambdaInstance = configureLambdaUploadDocumentMetadata(scope, logGroups.documentOperations);
    documentGeneratePreSignedLambdaInstance = configureLambdaDocumentGeneratePreSignedUrl(scope, logGroups.documentOperations);
    auditStoreEventLambdaInstance = configureLambdaStoreAuditEvent(scope, logGroups.documentOperations);
    notificationsSendLambdaInstance = configureLambdaSendNotifications(scope, logGroups.documentOperations);
    errorsHandlingLambdaInstance = configureLambdaErrorHandling(scope, logGroups.documentOperations);
}

/**
 * Configures an AWS Lambda function to validate base64-encoded documents.
 * This function creates an IAM role for the Lambda function, adds a policy to allow
 * writing to CloudWatch logs, and sets up the Lambda function with necessary configurations.
 * @param {Construct} scope - The scope in which this resource is defined.
 * @param {LogGroup} logGroup - An object containing references to CloudWatch log group.
 * @returns {NodejsFunction} - The configured NodejsFunction instance.
 */
const configureLambdaValidateBase64Document = (scope: Construct, logGroup: LogGroup): NodejsFunction => {
    const iamRole = createLambdaRole(scope, ResourceName.iam.DOCUMENT_VALIDATE_BASE64);
    addCloudWatchPutPolicy(iamRole, ResourceName.cloudWatch.DOCUMENT_OPERATIONS_LOGS_GROUP);
    const lambda = new NodejsFunction(scope, ResourceName.lambdas.DOCUMENT_VALIDATE_BASE64, {
        functionName: ResourceName.lambdas.DOCUMENT_VALIDATE_BASE64,
        description: 'Checks if the document meets certain criteria before uploading.',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/document-validate-base64.ts`),
        memorySize: 256,
        timeout: Duration.minutes(3),
        handler: 'handler',
        logGroup: logGroup,
        role: iamRole,
        environment: {
            REGION: process.env.AWS_REGION || '',
        }
    });
    return lambda;   
}
/**
 * Configures an AWS Lambda function to upload base64-encoded documents to an S3 bucket.
 * This function creates an IAM role for the Lambda function, adds a policy to allow
 * writing to CloudWatch logs and S3 bucket, and sets up the Lambda function with necessary configurations.
 *
 * @param {Construct} scope - The scope in which this resource is defined.
 * @param {LogGroup} logGroup - The CloudWatch log group for logging Lambda function activity.
 * 
 * @returns {NodejsFunction} - The configured NodejsFunction instance.
 *
 */
const configureLambdaUploadBase64Document = (scope: Construct, logGroup: LogGroup): NodejsFunction => {
    const iamRole = createLambdaRole(scope, ResourceName.iam.DOCUMENT_UPLOAD_BASE64);
    addCloudWatchPutPolicy(iamRole, logGroup.logGroupName);
    addS3WritePolicy(iamRole, ResourceName.s3Buckets.DOCUMENTS_BUCKET);
    const lambda = new NodejsFunction(scope, ResourceName.lambdas.DOCUMENT_UPLOAD_BASE64, {
        functionName: ResourceName.lambdas.DOCUMENT_UPLOAD_BASE64,
        description: 'Uploads base64 document in S3 bucket',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/document-upload-base64.ts`),
        memorySize: 256,
        timeout: Duration.minutes(3),
        handler: 'handler',
        logGroup: logGroup,
        role: iamRole,
        environment: {
            REGION: process.env.AWS_REGION || '',
            BUCKET_NAME: ResourceName.s3Buckets.DOCUMENTS_BUCKET,
        },
    });
    return lambda;   
}
/**
 * Configures an AWS Lambda function to upload document metadata to a DynamoDB table.
 * This function creates an IAM role for the Lambda function, adds policies to allow
 * writing to CloudWatch logs and DynamoDB, and sets up the Lambda function with necessary configurations.
 *
 * @param {Construct} scope - The scope in which this resource is defined.
 * @param {LogGroup} logGroup - The CloudWatch log group for logging Lambda function activity.
 * 
 * @returns {NodejsFunction} - The configured NodejsFunction instance.
 *
 */
const configureLambdaUploadDocumentMetadata = (scope: Construct, logGroup: LogGroup): NodejsFunction => {
    const iamRole = createLambdaRole(scope, ResourceName.iam.DOCUMENT_UPLOAD_METADATA);
    addCloudWatchPutPolicy(iamRole, logGroup.logGroupName);
    addDynamoDbWritePolicy(iamRole, ResourceName.dynamoDbTables.DOCUMENTS_METADATA); 
    const lambda = new NodejsFunction(scope, ResourceName.lambdas.DOCUMENT_UPLOAD_METADATA, {
        functionName: ResourceName.lambdas.DOCUMENT_UPLOAD_METADATA,
        description: 'Saves metadata of the uploaded document in the DynamoDB',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/document-upload-metadata.ts`),
        memorySize: 256,
        timeout: Duration.minutes(3),
        handler: 'handler',
        logGroup: logGroup,
        role: iamRole,
        environment: {
            REGION: process.env.AWS_REGION || '',
            TABLE_NAME: ResourceName.dynamoDbTables.DOCUMENTS_METADATA
        },
    });
    return lambda;   
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
 const configureLambdaStoreAuditEvent = (scope: Construct, logGroup: LogGroup): NodejsFunction => {
    const iamRole = createLambdaRole(scope, ResourceName.iam.AUDIT_STORE_EVENT);
    addCloudWatchPutPolicy(iamRole, logGroup.logGroupName);
    addDynamoDbWritePolicy(iamRole, ResourceName.dynamoDbTables.DOCUMENTS_AUDIT); 
    const lambda = new NodejsFunction(scope, ResourceName.lambdas.AUDIT_STORE_EVENT, {
        functionName: ResourceName.lambdas.AUDIT_STORE_EVENT,
        description: 'Stores audit events in the DynamoDB',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/audit-store-event.ts`),
        memorySize: 256,
        timeout: Duration.minutes(3),
        handler: 'handler',
        logGroup: logGroup,
        role: iamRole,
        environment: {
            REGION: process.env.AWS_REGION || '',
            TABLE_NAME: ResourceName.dynamoDbTables.DOCUMENTS_AUDIT
        },
    });
    return lambda;   
}
/**
 * Configures an AWS Lambda function to send email notifications to stakeholders.
 * This function creates an IAM role for the Lambda function, adds a policy to allow
 * writing to CloudWatch logs, and sets up the Lambda function with necessary configurations.
 *
 * @param {Construct} scope - The scope in which this resource is defined.
 * @param {LogGroup} logGroup - The CloudWatch log group for logging Lambda function activity.
 * 
 * @returns {NodejsFunction} - The configured NodejsFunction instance.
 */
const configureLambdaSendNotifications = (scope: Construct, logGroup: LogGroup): NodejsFunction => {
    const iamRole = createLambdaRole(scope, ResourceName.iam.NOTIFICATIONS_SEND);
    addCloudWatchPutPolicy(iamRole, logGroup.logGroupName);
    const lambda = new NodejsFunction(scope, ResourceName.lambdas.NOTIFICATIONS_SEND, {
        functionName: ResourceName.lambdas.NOTIFICATIONS_SEND,
        description: 'Sends list of email notifications to stakeholders',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/notifications-send.ts`),
        memorySize: 256,
        timeout: Duration.minutes(3),
        handler: 'handler',
        logGroup: logGroup,
        role: iamRole,
        environment: {
            REGION: process.env.AWS_REGION || '',
            EMS_SERVICE_URL: process.env.EMS_SERVICE_URL || '',
            EMS_SERVICE_TOKEN: process.env.EMS_SERVICE_TOKEN || ''
        },
    });
    return lambda;   
}
/**
 * Configures an AWS Lambda function to retrieve an S3 object pre-signed URL and return it to the end-user.
 * This function creates an IAM role for the Lambda function, adds policies to allow
 * writing to CloudWatch logs, reading from DynamoDB, and reading from S3, and sets up the Lambda function with necessary configurations.
 *
 * @param {Construct} scope - The scope in which this resource is defined.
 * @param {LogGroup} logGroup - The CloudWatch log group for logging Lambda function activity.
 * 
 * @returns {NodejsFunction} - The configured NodejsFunction instance.
 *
 */
const configureLambdaDocumentGeneratePreSignedUrl = (scope: Construct, logGroup: LogGroup): NodejsFunction => {
    const iamRole = createLambdaRole(scope, ResourceName.iam.DOCUMENT_GENERATE_PRESIGNED_URL);
    addCloudWatchPutPolicy(iamRole, logGroup.logGroupName);
    addDynamoDbReadPolicy(iamRole, ResourceName.dynamoDbTables.DOCUMENTS_METADATA);  
    addS3ReadPolicy(iamRole, ResourceName.s3Buckets.DOCUMENTS_BUCKET);
    const lambda = new NodejsFunction(scope, ResourceName.lambdas.DOCUMENT_GENERATE_PRESIGNED_URL, {
        functionName: ResourceName.lambdas.DOCUMENT_GENERATE_PRESIGNED_URL,
        description: 'Retrieves the S3 object pre-signed URL and returns it to the end-user',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/document-view.ts`),
        memorySize: 256,
        timeout: Duration.minutes(3),
        handler: 'handler',
        logGroup: logGroup,
        role: iamRole,
        environment: {
            REGION: process.env.AWS_REGION || '',
            BUCKET_NAME: ResourceName.s3Buckets.DOCUMENTS_BUCKET,
            TABLE_NAME: ResourceName.dynamoDbTables.DOCUMENTS_METADATA
        },
    });
    return lambda;   
}

/**
 * Configures a Lambda function for handling errors in state machines.
 * 
 * This function sets up an AWS Lambda function designed to process and manage errors
 * that occur within state machines. It creates an IAM role with necessary permissions,
 * sets up CloudWatch logging, SNS topic, and defines the Lambda function's configuration, including
 * memory size, timeout, and environment variables.
 * 
 * @param scope - The CDK construct scope in which this Lambda function is defined.
 * @param logGroup - The CloudWatch Log Group where the Lambda function logs its output.
 * 
 * @returns The configured NodejsFunction instance for error handling.
 */
const configureLambdaErrorHandling = (scope: Construct, logGroup: LogGroup): NodejsFunction => {
    const iamRole = createLambdaRole(scope, ResourceName.iam.ERRORS_HANDLING);
    addCloudWatchPutPolicy(iamRole, logGroup.logGroupName);
    const lambda = new NodejsFunction(scope, ResourceName.lambdas.ERRORS_HANDLING, {
        functionName: ResourceName.lambdas.ERRORS_HANDLING,
        description: 'Processes errors from State Machines',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/errors-handling.ts`),
        memorySize: 256,
        timeout: Duration.minutes(3),
        handler: 'handler',
        logGroup: logGroup,
        role: iamRole,
        environment: {
            REGION: process.env.AWS_REGION || '',
        },
    });
    return lambda;   
}