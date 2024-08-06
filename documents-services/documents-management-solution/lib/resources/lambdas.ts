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
import { auditTables, metadataTables, ResourceName, verificationTables } from '../resource-reference';
import { LogGroup } from 'aws-cdk-lib/aws-logs';

const lambdaFilesLocation = '../../functions';

/**
 * Lambdas, related to Documents operations functionality
 */
let documentGeneratePreSignedUploadUrlsLambdaInstance: NodejsFunction;
export const documentGeneratePreSignedUploadUrlsLambda = () => documentGeneratePreSignedUploadUrlsLambdaInstance;
let documentS3UploadListenerLambdaInstance: NodejsFunction;
export const documentS3UploadListenerLambda = () => documentS3UploadListenerLambdaInstance;
let documentGetListByStatusLambdaInstance: NodejsFunction;
export const documentGetListByStatusLambda = () => documentGetListByStatusLambdaInstance;
let documentGetListByOwnerLambdaInstance: NodejsFunction;
export const documentGetListByOwnerLambda = () => documentGetListByOwnerLambdaInstance;
let documentGeneratePreSignedLambdaInstance: NodejsFunction;
export const documentGeneratePreSignedLambda = () => documentGeneratePreSignedLambdaInstance;
let documentUploadMetadataLambdaInstance: NodejsFunction;
export const documentUploadMetadataLambda = () => documentUploadMetadataLambdaInstance;
let documentGetMetadataLambdaInstance: NodejsFunction;
export const documentGetMetadataLambda = () => documentGetMetadataLambdaInstance;

/**
 * Lambdas, related to Audit functionality
 */
let auditStoreEventLambdaInstance: NodejsFunction;
export const auditStoreEventLambda = () => auditStoreEventLambdaInstance;
let auditGetEventsLambdaInstance: NodejsFunction;
export const auditGetEventsLambda = () => auditGetEventsLambdaInstance;

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
    documentGeneratePreSignedUploadUrlsLambdaInstance = configureLambdaGeneratePreSignedUploadUrls(scope, logGroups.documentOperations);
    documentS3UploadListenerLambdaInstance = configureLambdaS3UploadListener(scope, logGroups.documentOperations);
    documentGetListByStatusLambdaInstance = configureLambdaGetListByStatus(scope, logGroups.documentOperations);
    documentGetListByOwnerLambdaInstance = configureLambdaGetListByOwner(scope, logGroups.documentOperations);
    documentGeneratePreSignedLambdaInstance = configureLambdaDocumentGeneratePreSignedUrl(scope, logGroups.documentOperations);
    documentUploadMetadataLambdaInstance = configureLambdaUploadDocumentMetadata(scope, logGroups.documentOperations);
    documentGetMetadataLambdaInstance = configureLambdaGetDocumentMetadata(scope, logGroups.documentOperations);
    
    auditStoreEventLambdaInstance = configureLambdaStoreAuditEvent(scope, logGroups.documentAudit);
    auditGetEventsLambdaInstance = configureLambdaGetAuditEvents(scope, logGroups.documentAudit);

    verifyUpdateTrailLambdaInstance = configureLambdaVerifyUpdateTrail(scope, logGroups.documentOperations);
}

const configureLambdaGeneratePreSignedUploadUrls = (scope: Construct, logGroup: LogGroup): NodejsFunction => {
    const iamRole = createLambdaRole(scope, ResourceName.iam.DOCUMENT_GENERATE_PRESIGN_UPLOAD_URLS);
    addCloudWatchPutPolicy(iamRole, logGroup.logGroupName);
    addS3WritePolicy(iamRole, ResourceName.s3Buckets.DOCUMENTS_BUCKET);
    const lambda = new NodejsFunction(scope, ResourceName.lambdas.DOCUMENT_GENERATE_PRESIGN_UPLOAD_URLS, {
        functionName: ResourceName.lambdas.DOCUMENT_GENERATE_PRESIGN_UPLOAD_URLS,
        description: 'Updates verification history',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/documents/generate-presigned-upload-urls.ts`),
        logGroup: logGroup,
        role: iamRole,
        environment: {
            REGION: process.env.AWS_REGION || '',
            AWS_RESOURCES_NAME_PREFIX: process.env.AWS_RESOURCES_NAME_PREFIX || '',
            TAG_ENVIRONMENT: process.env.TAG_ENVIRONMENT || '',
            BUCKET_NAME: ResourceName.s3Buckets.DOCUMENTS_BUCKET,
        },
        ...defaultLambdaSettings
    });
    return lambda;   
}
const configureLambdaS3UploadListener = (scope: Construct, logGroup: LogGroup): NodejsFunction => {
    const iamRole = createLambdaRole(scope, ResourceName.iam.DOCUMENT_S3_UPLOAD_LISTENER);
    addCloudWatchPutPolicy(iamRole, logGroup.logGroupName);
    addS3ReadPolicy(iamRole, ResourceName.s3Buckets.DOCUMENTS_BUCKET);
    let tables = metadataTables();
    tables.forEach((tableName) => {
        let name = tableName.replace('$2', '');
        addDynamoDbWritePolicy(iamRole, name);
    });
    tables = auditTables();
    tables.forEach((tableName) => {
        let name = tableName.replace('$2', '');
        addDynamoDbWritePolicy(iamRole, name);
    });
    const lambda = new NodejsFunction(scope, ResourceName.lambdas.DOCUMENT_S3_UPLOAD_LISTENER, {
        functionName: ResourceName.lambdas.DOCUMENT_S3_UPLOAD_LISTENER,
        description: 'Listens upload to S3 bucket events and store metadata / audit data into DynamoDB',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/documents/s3-update-listener.ts`),
        logGroup: logGroup,
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
const configureLambdaGetListByStatus = (scope: Construct, logGroup: LogGroup): NodejsFunction => {
    const iamRole = createLambdaRole(scope, ResourceName.iam.DOCUMENT_GET_LIST_BY_STATUS);
    addCloudWatchPutPolicy(iamRole, logGroup.logGroupName);
    const tables = metadataTables();
    tables.forEach((tableName) => {
        let name = tableName.replace('$2', '');
        let indexName = tableName.replace('$2', `-${ResourceName.dynamoDbTables.INDEX_NAMES_SUFFIXES.STATUS_AND_OWNER}`);
        addDynamoDbIndexReadPolicy(iamRole, name, indexName);
    });
    const lambda = new NodejsFunction(scope, ResourceName.lambdas.DOCUMENT_GET_LIST_BY_STATUS, {
        functionName: ResourceName.lambdas.DOCUMENT_GET_LIST_BY_STATUS,
        description: 'Retrieves list of documents by Status',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/documents/get-list-by-status.ts`),
        logGroup: logGroup,
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
const configureLambdaGetListByOwner = (scope: Construct, logGroup: LogGroup): NodejsFunction => {
    const iamRole = createLambdaRole(scope, ResourceName.iam.DOCUMENT_GET_LIST_BY_OWNER);
    addCloudWatchPutPolicy(iamRole, logGroup.logGroupName);
    const tables = metadataTables();
    tables.forEach((tableName) => {
        let name = tableName.replace('$2', '');
        let indexName = tableName.replace('$2', `-${ResourceName.dynamoDbTables.INDEX_NAMES_SUFFIXES.OWNER}`);
        addDynamoDbIndexReadPolicy(iamRole, name, indexName);
    });
    const lambda = new NodejsFunction(scope, ResourceName.lambdas.DOCUMENT_GET_LIST_BY_OWNER, {
        functionName: ResourceName.lambdas.DOCUMENT_GET_LIST_BY_OWNER,
        description: 'Retrieves list of documents by Owner ID',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/documents/get-list-by-owner.ts`),
        logGroup: logGroup,
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
    const tables = metadataTables();
    tables.forEach((tableName) => {
        let name = tableName.replace('$2', '');
        addDynamoDbWritePolicy(iamRole, name); 
    })
    const lambda = new NodejsFunction(scope, ResourceName.lambdas.DOCUMENT_UPLOAD_METADATA, {
        functionName: ResourceName.lambdas.DOCUMENT_UPLOAD_METADATA,
        description: 'Saves metadata of the uploaded document in the DynamoDB',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/documents/add-metadata.ts`),
        logGroup: logGroup,
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
    const tables = metadataTables();
    tables.forEach((tableName) => {
        let name = tableName.replace('$2', '');
        addDynamoDbReadPolicy(iamRole, name);
    });
    addS3ReadPolicy(iamRole, ResourceName.s3Buckets.DOCUMENTS_BUCKET);
    const lambda = new NodejsFunction(scope, ResourceName.lambdas.DOCUMENT_GENERATE_PRESIGNED_URL, {
        functionName: ResourceName.lambdas.DOCUMENT_GENERATE_PRESIGNED_URL,
        description: 'Retrieves the S3 object pre-signed URL and returns it to the end-user',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/documents/generate-presigned-url.ts`),
        logGroup: logGroup,
        role: iamRole,
        environment: {
            REGION: process.env.AWS_REGION || '',
            AWS_RESOURCES_NAME_PREFIX: process.env.AWS_RESOURCES_NAME_PREFIX || '',
            TAG_ENVIRONMENT: process.env.TAG_ENVIRONMENT || '',
            BUCKET_NAME: ResourceName.s3Buckets.DOCUMENTS_BUCKET,
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
    const tables = auditTables();
    tables.forEach((tableName) => {
        let name = tableName.replace('$2', '');
        addDynamoDbWritePolicy(iamRole, name); 
    });
    const lambda = new NodejsFunction(scope, ResourceName.lambdas.AUDIT_STORE_EVENT, {
        functionName: ResourceName.lambdas.AUDIT_STORE_EVENT,
        description: 'Stores audit events in the DynamoDB',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/audit/audit-store-event.ts`),
        logGroup: logGroup,
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
 const configureLambdaGetAuditEvents = (scope: Construct, logGroup: LogGroup): NodejsFunction => {
    const iamRole = createLambdaRole(scope, ResourceName.iam.AUDIT_GET_EVENTS);
    addCloudWatchPutPolicy(iamRole, logGroup.logGroupName);
    const tables = auditTables();
    tables.forEach((tableName) => {
        let name = tableName.replace('$2', '');
        addDynamoDbReadPolicy(iamRole, name);
        let indexName = tableName.replace('$2', `-${ResourceName.dynamoDbTables.INDEX_NAMES_SUFFIXES.EVENT_INITIATOR_AND_DOC_ID}`);
        addDynamoDbIndexReadPolicy(iamRole, name, indexName);
        indexName = tableName.replace('$2', `-${ResourceName.dynamoDbTables.INDEX_NAMES_SUFFIXES.DOCUMENT_ID_AND_EVENT_INITIATOR}`);
        addDynamoDbIndexReadPolicy(iamRole, name, indexName);
    });
    const lambda = new NodejsFunction(scope, ResourceName.lambdas.AUDIT_GET_EVENTS, {
        functionName: ResourceName.lambdas.AUDIT_GET_EVENTS,
        description: 'Get list of audit events',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/audit/audit-get-events.ts`),
        logGroup: logGroup,
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

 const configureLambdaGetDocumentMetadata = (scope: Construct, logGroup: LogGroup): NodejsFunction => {
    const iamRole = createLambdaRole(scope, ResourceName.iam.DOCUMENT_GET_METADATA);
    addCloudWatchPutPolicy(iamRole, logGroup.logGroupName);
    const tables = metadataTables();
    tables.forEach((tableName) => {
        let name = tableName.replace('$2', '');
        addDynamoDbReadPolicy(iamRole, name);
    });
    const lambda = new NodejsFunction(scope, ResourceName.lambdas.DOCUMENT_GET_METADATA, {
        functionName: ResourceName.lambdas.DOCUMENT_GET_METADATA,
        description: 'Retrieves information about document metadata',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/documents/get-metadata.ts`),
        logGroup: logGroup,
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

const configureLambdaVerifyUpdateTrail = (scope: Construct, logGroup: LogGroup): NodejsFunction => {
    const iamRole = createLambdaRole(scope, ResourceName.iam.VERIFY_UPDATE_TRAIL);
    addCloudWatchPutPolicy(iamRole, logGroup.logGroupName);
    let tables = metadataTables();
    tables.forEach((tableName) => {
        let name = tableName.replace('$2', '');
        addDynamoDbReadPolicy(iamRole, name);
    });
    tables = verificationTables();
    tables.forEach((tableName) => {
        let name = tableName.replace('$2', '');
        addDynamoDbWritePolicy(iamRole, name);
    });
    const lambda = new NodejsFunction(scope, ResourceName.lambdas.VERIFY_UPDATE_TRAIL, {
        functionName: ResourceName.lambdas.VERIFY_UPDATE_TRAIL,
        description: 'Updates verification history',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/verify/update-trail.ts`),
        logGroup: logGroup,
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



