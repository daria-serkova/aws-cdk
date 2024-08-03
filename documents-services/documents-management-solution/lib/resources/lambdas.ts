
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
    addS3ReadPolicy,
    addDynamoDbIndexReadPolicy
} from './iam';
import { ResourceName } from '../resource-reference';
import { LogGroup } from 'aws-cdk-lib/aws-logs';

const lambdaFilesLocation = '../../functions';

/**
 * Lambdas, related to Documents operations functionality
 */
let documentValidateBase64LambdaInstance: NodejsFunction;
let documentValidateLambdaInstance: NodejsFunction;
let documentUploadBase64LambdaInstance: NodejsFunction;
let documentUploadMetadataLambdaInstance: NodejsFunction;
let documentGeneratePreSignedLambdaInstance: NodejsFunction;
let documentGetMetadataLambdaInstance: NodejsFunction;
let documentGetListByStatusLambdaInstance: NodejsFunction;
let documentGetListByOwnerLambdaInstance: NodejsFunction;
export const documentValidateBase64Lambda = () => documentValidateBase64LambdaInstance;
export const documentValidateLambda = () => documentValidateLambdaInstance;
export const documentUploadBase64Lambda = () => documentUploadBase64LambdaInstance;
export const documentUploadMetadataLambda = () => documentUploadMetadataLambdaInstance;
export const documentGetMetadataLambda = () => documentGetMetadataLambdaInstance;
export const documentGeneratePreSignedLambda = () => documentGeneratePreSignedLambdaInstance;
export const documentGetListByStatusLambda = () => documentGetListByStatusLambdaInstance;
export const documentGetListByOwnerLambda = () => documentGetListByOwnerLambdaInstance;

/**
 * Lambdas, related to Communication functionality
 */
let notificationsSendLambdaInstance: NodejsFunction;
export const notificationsSendLambda = () => notificationsSendLambdaInstance;
/**
 * Lambdas, related to Audit functionality
 */
let auditStoreEventLambdaInstance: NodejsFunction;
let auditGetEventsLambdaInstance: NodejsFunction;
export const auditStoreEventLambda = () => auditStoreEventLambdaInstance;
export const auditGetEventsLambda = () => auditGetEventsLambdaInstance;
/**
 * Lambdas, related to Errors handling
 */
let errorsHandlingLambdaInstance: NodejsFunction;
export const errorsHandlingLambda = () => errorsHandlingLambdaInstance;

/**
 * Lambdas, related to Verification handling
 */
 let verifyUpdateTrailLambdaInstance: NodejsFunction;
 export const verifyUpdateTrailLambda = () => verifyUpdateTrailLambdaInstance;

 const defaultLambdaSettings = {
    memorySize: 256,
    timeout: Duration.minutes(3),
    handler: 'handler',
 }
/**
 * Configuration of Lambda functions
 * @param scope 
 */
export default function configureLambdaResources(
        scope: Construct, 
        logGroups: { 
            documentOperations: LogGroup, 
            documentAudit: LogGroup    
}) {
    documentValidateBase64LambdaInstance = configureLambdaValidateBase64Document(scope, logGroups.documentOperations);
    documentValidateLambdaInstance = configureLambdaValidateDocument(scope, logGroups.documentOperations);
    documentUploadBase64LambdaInstance = configureLambdaUploadBase64Document(scope, logGroups.documentOperations);
    documentUploadMetadataLambdaInstance = configureLambdaUploadDocumentMetadata(scope, logGroups.documentOperations);
    documentGeneratePreSignedLambdaInstance = configureLambdaDocumentGeneratePreSignedUrl(scope, logGroups.documentOperations);
    documentGetMetadataLambdaInstance = configureLambdaGetDocumentMetadata(scope, logGroups.documentOperations);
    documentGetListByStatusLambdaInstance = configureLambdaGetListByStatus(scope, logGroups.documentOperations);
    documentGetListByOwnerLambdaInstance = configureLambdaGetListByOwner(scope, logGroups.documentOperations);

    notificationsSendLambdaInstance = configureLambdaSendNotifications(scope, logGroups.documentOperations);
    errorsHandlingLambdaInstance = configureLambdaErrorHandling(scope, logGroups.documentOperations);

    auditStoreEventLambdaInstance = configureLambdaStoreAuditEvent(scope, logGroups.documentAudit);
    auditGetEventsLambdaInstance = configureLambdaGetAuditEvents(scope, logGroups.documentAudit);

    verifyUpdateTrailLambdaInstance = configureLambdaVerifyUpdateTrail(scope, logGroups.documentOperations);
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
    const iamRole = createLambdaRole(scope, ResourceName.iam.DOCUMENT_VALIDATE_BASE64_DOCUMENT);
    addCloudWatchPutPolicy(iamRole, ResourceName.cloudWatch.DOCUMENT_OPERATIONS_LOGS_GROUP);
    const lambda = new NodejsFunction(scope, ResourceName.lambdas.DOCUMENT_VALIDATE_BASE64_DOCUMENT, {
        functionName: ResourceName.lambdas.DOCUMENT_VALIDATE_BASE64_DOCUMENT,
        description: 'Checks if the document meets certain criteria before uploading.',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/documents/validate-base64-document.ts`),
        logGroup: logGroup,
        role: iamRole,
        environment: {
            REGION: process.env.AWS_REGION || '',
        },
        ...defaultLambdaSettings
    });
    return lambda;   
}
const configureLambdaValidateDocument = (scope: Construct, logGroup: LogGroup): NodejsFunction => {
    const iamRole = createLambdaRole(scope, ResourceName.iam.DOCUMENT_VALIDATE_DOCUMENT);
    addCloudWatchPutPolicy(iamRole, ResourceName.cloudWatch.DOCUMENT_OPERATIONS_LOGS_GROUP);
    const lambda = new NodejsFunction(scope, ResourceName.lambdas.DOCUMENT_VALIDATE_DOCUMENT, {
        functionName: ResourceName.lambdas.DOCUMENT_VALIDATE_DOCUMENT,
        description: 'Checks if the document meets certain criteria before uploading.',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/documents/validate-document.ts`),
        logGroup: logGroup,
        role: iamRole,
        environment: {
            REGION: process.env.AWS_REGION || '',
        },
        ...defaultLambdaSettings
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
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/documents/upload-base64.ts`),
        logGroup: logGroup,
        role: iamRole,
        environment: {
            REGION: process.env.AWS_REGION || '',
            BUCKET_NAME: ResourceName.s3Buckets.DOCUMENTS_BUCKET,
        },
        ...defaultLambdaSettings
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
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/documents/add-metadata.ts`),
        logGroup: logGroup,
        role: iamRole,
        environment: {
            REGION: process.env.AWS_REGION || '',
            TABLE_NAME: ResourceName.dynamoDbTables.DOCUMENTS_METADATA
        },
        ...defaultLambdaSettings
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
        logGroup: logGroup,
        role: iamRole,
        environment: {
            REGION: process.env.AWS_REGION || '',
            EMS_SERVICE_URL: process.env.EMS_SERVICE_URL || '',
            EMS_SERVICE_TOKEN: process.env.EMS_SERVICE_TOKEN || ''
        },
        ...defaultLambdaSettings
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
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/documents/generate-presigned-url.ts`),
        logGroup: logGroup,
        role: iamRole,
        environment: {
            REGION: process.env.AWS_REGION || '',
            BUCKET_NAME: ResourceName.s3Buckets.DOCUMENTS_BUCKET,
            TABLE_NAME: ResourceName.dynamoDbTables.DOCUMENTS_METADATA
        },
        ...defaultLambdaSettings
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
        logGroup: logGroup,
        role: iamRole,
        environment: {
            REGION: process.env.AWS_REGION || '',
        },
        ...defaultLambdaSettings
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
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/audit/audit-store-event.ts`),
        logGroup: logGroup,
        role: iamRole,
        environment: {
            REGION: process.env.AWS_REGION || '',
            TABLE_NAME: ResourceName.dynamoDbTables.DOCUMENTS_AUDIT
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
 const configureLambdaGetAuditEvents = (scope: Construct, logGroup: LogGroup): NodejsFunction => {
    const iamRole = createLambdaRole(scope, ResourceName.iam.AUDIT_GET_EVENTS);
    addCloudWatchPutPolicy(iamRole, logGroup.logGroupName); 
    addDynamoDbIndexReadPolicy(iamRole, ResourceName.dynamoDbTables.DOCUMENTS_AUDIT, 
        ResourceName.dynamoDbTables.DOCUMENTS_AUDIT_INDEX_DOCUMENT_ID); 
    addDynamoDbIndexReadPolicy(iamRole, ResourceName.dynamoDbTables.DOCUMENTS_AUDIT, 
        ResourceName.dynamoDbTables.DOCUMENTS_AUDIT_INDEX_EVENT_INITIATOR); 
    const lambda = new NodejsFunction(scope, ResourceName.lambdas.AUDIT_GET_EVENTS, {
        functionName: ResourceName.lambdas.AUDIT_GET_EVENTS,
        description: 'Get list of audit events',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/audit/audit-get-events.ts`),
        logGroup: logGroup,
        role: iamRole,
        environment: {
            REGION: process.env.AWS_REGION || '',
            TABLE_NAME: ResourceName.dynamoDbTables.DOCUMENTS_AUDIT,
            INDEX_DOCUMENT_ID_NAME: ResourceName.dynamoDbTables.DOCUMENTS_AUDIT_INDEX_DOCUMENT_ID,
            INDEX_USER_ID_NAME: ResourceName.dynamoDbTables.DOCUMENTS_AUDIT_INDEX_EVENT_INITIATOR,
        },
        ...defaultLambdaSettings
    });
    return lambda;   
}

 const configureLambdaGetDocumentMetadata = (scope: Construct, logGroup: LogGroup): NodejsFunction => {
    const iamRole = createLambdaRole(scope, ResourceName.iam.DOCUMENT_GET_METADATA);
    addCloudWatchPutPolicy(iamRole, logGroup.logGroupName);
    addDynamoDbReadPolicy(iamRole, ResourceName.dynamoDbTables.DOCUMENTS_METADATA);
    const lambda = new NodejsFunction(scope, ResourceName.lambdas.DOCUMENT_GET_METADATA, {
        functionName: ResourceName.lambdas.DOCUMENT_GET_METADATA,
        description: 'Retrieves information about document metadata',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/documents/get-metadata.ts`),
        logGroup: logGroup,
        role: iamRole,
        environment: {
            REGION: process.env.AWS_REGION || '',
            TABLE_NAME: ResourceName.dynamoDbTables.DOCUMENTS_METADATA,
        },
        ...defaultLambdaSettings
    });
    return lambda;   
}

const configureLambdaGetListByStatus = (scope: Construct, logGroup: LogGroup): NodejsFunction => {
    const iamRole = createLambdaRole(scope, ResourceName.iam.DOCUMENT_GET_LIST_BY_STATUS);
    addCloudWatchPutPolicy(iamRole, logGroup.logGroupName);
    addDynamoDbIndexReadPolicy(iamRole, 
        ResourceName.dynamoDbTables.DOCUMENTS_METADATA,
        ResourceName.dynamoDbTables.DOCUMENTS_METADATA_INDEX_STATUS);
    const lambda = new NodejsFunction(scope, ResourceName.lambdas.DOCUMENT_GET_LIST_BY_STATUS, {
        functionName: ResourceName.lambdas.DOCUMENT_GET_LIST_BY_STATUS,
        description: 'Retrieves list of documents by Status',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/documents/get-list-by-status.ts`),
        logGroup: logGroup,
        role: iamRole,
        environment: {
            REGION: process.env.AWS_REGION || '',
            TABLE_NAME: ResourceName.dynamoDbTables.DOCUMENTS_METADATA,
            INDEX: ResourceName.dynamoDbTables.DOCUMENTS_METADATA_INDEX_STATUS
        },
        ...defaultLambdaSettings
    });
    return lambda;   
}
const configureLambdaGetListByOwner = (scope: Construct, logGroup: LogGroup): NodejsFunction => {
    const iamRole = createLambdaRole(scope, ResourceName.iam.DOCUMENT_GET_LIST_BY_OWNER);
    addCloudWatchPutPolicy(iamRole, logGroup.logGroupName);
    addDynamoDbIndexReadPolicy(iamRole, 
        ResourceName.dynamoDbTables.DOCUMENTS_METADATA,
        ResourceName.dynamoDbTables.DOCUMENTS_METADATA_INDEX_DOCUMENT_OWNER);
    const lambda = new NodejsFunction(scope, ResourceName.lambdas.DOCUMENT_GET_LIST_BY_OWNER, {
        functionName: ResourceName.lambdas.DOCUMENT_GET_LIST_BY_OWNER,
        description: 'Retrieves list of documents by Owner ID',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/documents/get-list-by-owner.ts`),
        logGroup: logGroup,
        role: iamRole,
        environment: {
            REGION: process.env.AWS_REGION || '',
            TABLE_NAME: ResourceName.dynamoDbTables.DOCUMENTS_METADATA,
            INDEX: ResourceName.dynamoDbTables.DOCUMENTS_METADATA_INDEX_DOCUMENT_OWNER
        },
        ...defaultLambdaSettings
    });
    return lambda;   
}

const configureLambdaVerifyUpdateTrail = (scope: Construct, logGroup: LogGroup): NodejsFunction => {
    const iamRole = createLambdaRole(scope, ResourceName.iam.VERIFY_UPDATE_TRAIL);
    addCloudWatchPutPolicy(iamRole, logGroup.logGroupName);
    addDynamoDbReadPolicy(iamRole, ResourceName.dynamoDbTables.DOCUMENTS_METADATA);
    addDynamoDbWritePolicy(iamRole, ResourceName.dynamoDbTables.DOCUMENTS_VERIFICATION);
    const lambda = new NodejsFunction(scope, ResourceName.lambdas.VERIFY_UPDATE_TRAIL, {
        functionName: ResourceName.lambdas.VERIFY_UPDATE_TRAIL,
        description: 'Updates verification history',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/verify/update-trail.ts`),
        logGroup: logGroup,
        role: iamRole,
        environment: {
            REGION: process.env.AWS_REGION || '',
            METADATA_TABLE_NAME: ResourceName.dynamoDbTables.DOCUMENTS_METADATA,
            VERIFICATION_TABLE_NAME: ResourceName.dynamoDbTables.DOCUMENTS_VERIFICATION
        },
        ...defaultLambdaSettings
    });
    return lambda;   
}
