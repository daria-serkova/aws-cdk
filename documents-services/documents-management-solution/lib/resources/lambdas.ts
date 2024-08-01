
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { resolve, dirname } from 'path';
import { 
    addCloudWatchPutPolicy,  
    addDynamoDbWritePolicy,  
    addS3WritePolicy, 
    createLambdaRole,
    addS3ReadPolicy,
    addDynamoDbReadPolicy
} from './iam';
import { ResourceName } from '../resource-reference';
import { LogGroup } from 'aws-cdk-lib/aws-logs';

const lambdaFilesLocation = '../../functions';

let documentUploadBase64LambdaInstance: NodejsFunction;
let documentUploadMetadataLambdaInstance: NodejsFunction;
let storeAuditEventLambdaInstance: NodejsFunction;
let documentViewLambdaInstance: NodejsFunction;
let documentSendNotificationsLambdaInstance: NodejsFunction;

/**
 * Configuration of Lambda functions
 * @param scope 
 */
export default function configureLambdaResources(scope: Construct, logGroups: {
    documentOperations: LogGroup,
}) {
    const documentUploadBase64LambdaIamRole = createLambdaRole(scope, 
        ResourceName.iam.DOCUMENT_UPLOAD_BASE64_LAMBDA);
    addCloudWatchPutPolicy(documentUploadBase64LambdaIamRole, ResourceName.cloudWatch.DOCUMENT_OPERATIONS_LOGS_GROUP); 
    addS3WritePolicy(documentUploadBase64LambdaIamRole, ResourceName.s3Buckets.DOCUMENTS_BUCKET);
    documentUploadBase64LambdaInstance = new NodejsFunction(scope, 
        ResourceName.lambdas.DOCUMENT_UPLOAD_BASE64, 
        {
            functionName: ResourceName.lambdas.DOCUMENT_UPLOAD_BASE64,
            description: 'Uploads base64 document in S3 bucket ',
            entry: resolve(dirname(__filename), `${lambdaFilesLocation}/document-upload-base64.ts`),
            memorySize: 256,
            timeout: Duration.minutes(3),
            handler: 'handler',
            logGroup: logGroups.documentOperations,
            role: documentUploadBase64LambdaIamRole,
            environment: {
                REGION: process.env.AWS_REGION || '',
                BUCKET_NAME: ResourceName.s3Buckets.DOCUMENTS_BUCKET,
                UPLOAD_NOTIFICATION_RECIPIENT: process.env.UPLOAD_NOTIFICATION_RECIPIENT || ''
            },
        }     
    );

    const documentUploadMetadataLambdaIamRole = createLambdaRole(scope, ResourceName.iam.DOCUMENT_UPLOAD_METADATA_LAMBDA);
    addCloudWatchPutPolicy(documentUploadMetadataLambdaIamRole, ResourceName.cloudWatch.DOCUMENT_OPERATIONS_LOGS_GROUP);
    addDynamoDbWritePolicy(documentUploadMetadataLambdaIamRole, ResourceName.dynamoDbTables.DOCUMENTS_METADATA);   
    documentUploadMetadataLambdaInstance = new NodejsFunction(scope, 
        ResourceName.lambdas.DOCUMENT_UPLOAD_METADATA, 
        {
            functionName: ResourceName.lambdas.DOCUMENT_UPLOAD_METADATA,
            description: 'Saves metadata of the uploaded document in the DynamoDB',
            entry: resolve(dirname(__filename), `${lambdaFilesLocation}/document-upload-metadata.ts`),
            memorySize: 256,
            timeout: Duration.minutes(3),
            handler: 'handler',
            logGroup: logGroups.documentOperations,
            role: documentUploadMetadataLambdaIamRole,
            environment: {
                REGION: process.env.AWS_REGION || '',
                TABLE_NAME: ResourceName.dynamoDbTables.DOCUMENTS_METADATA
            },
        }     
    );

    const storeAuditEventLambdaIamRole = createLambdaRole(scope, ResourceName.iam.STORE_AUDIT_EVENT_LAMBDA);
    addCloudWatchPutPolicy(storeAuditEventLambdaIamRole, ResourceName.cloudWatch.DOCUMENT_OPERATIONS_LOGS_GROUP);
    addDynamoDbWritePolicy(storeAuditEventLambdaIamRole, ResourceName.dynamoDbTables.DOCUMENTS_AUDIT);   
    storeAuditEventLambdaInstance = new NodejsFunction(scope, 
        ResourceName.lambdas.STORE_AUDIT_EVENT, 
        {
            functionName: ResourceName.lambdas.STORE_AUDIT_EVENT,
            description: 'Stores audit events in the DynamoDB',
            entry: resolve(dirname(__filename), `${lambdaFilesLocation}/document-store-audit-event.ts`),
            memorySize: 256,
            timeout: Duration.minutes(3),
            handler: 'handler',
            logGroup: logGroups.documentOperations,
            role: storeAuditEventLambdaIamRole,
            environment: {
                REGION: process.env.AWS_REGION || '',
                TABLE_NAME: ResourceName.dynamoDbTables.DOCUMENTS_AUDIT
            },
        }     
    );

    const documentViewIamRole = createLambdaRole(scope, 
        ResourceName.iam.DOCUMENT_VIEW_LAMBDA);
    addCloudWatchPutPolicy(documentViewIamRole, ResourceName.cloudWatch.DOCUMENT_OPERATIONS_LOGS_GROUP);
    addDynamoDbReadPolicy(documentViewIamRole, ResourceName.dynamoDbTables.DOCUMENTS_METADATA);  
    addS3ReadPolicy(documentViewIamRole, ResourceName.s3Buckets.DOCUMENTS_BUCKET);
    documentViewLambdaInstance = new NodejsFunction(scope, 
        ResourceName.lambdas.DOCUMENT_VIEW, 
        {
            functionName: ResourceName.lambdas.DOCUMENT_VIEW,
            description: 'Retrieves the S3 object URL and returns it to the end-user',
            entry: resolve(dirname(__filename), `${lambdaFilesLocation}/document-view.ts`),
            memorySize: 256,
            timeout: Duration.minutes(3),
            handler: 'handler',
            logGroup: logGroups.documentOperations,
            role: documentViewIamRole,
            environment: {
                REGION: process.env.AWS_REGION || '',
                BUCKET_NAME: ResourceName.s3Buckets.DOCUMENTS_BUCKET,
                TABLE_NAME: ResourceName.dynamoDbTables.DOCUMENTS_METADATA
            },
        }     
    );
    const documentNotificationsIamRole = createLambdaRole(scope, 
        ResourceName.iam.DOCUMENT_NOTIFICATIONS_LAMBDA);
    addCloudWatchPutPolicy(documentNotificationsIamRole, ResourceName.cloudWatch.DOCUMENT_OPERATIONS_LOGS_GROUP);
    documentSendNotificationsLambdaInstance = new NodejsFunction(scope, 
        ResourceName.lambdas.DOCUMENT_NOTIFICATIONS, 
        {
            functionName: ResourceName.lambdas.DOCUMENT_NOTIFICATIONS,
            description: 'Sends email notifications to operation stakeholders',
            entry: resolve(dirname(__filename), `${lambdaFilesLocation}/document-notififaction.ts`),
            memorySize: 256,
            timeout: Duration.minutes(3),
            handler: 'handler',
            logGroup: logGroups.documentOperations,
            role: documentNotificationsIamRole,
            environment: {
                REGION: process.env.AWS_REGION || '',
                EMS_SERVICE_URL: process.env.EMS_SERVICE_URL || '',
                EMS_SERVICE_TOKEN: process.env.EMS_SERVICE_TOKEN || ''
            },
        }     
    );
}

export const documentUploadBase64Lambda = () => documentUploadBase64LambdaInstance;
export const documentUploadMetadataLambda = () => documentUploadMetadataLambdaInstance;
export const storeAuditEventLambda = () => storeAuditEventLambdaInstance;
export const documentViewLambda = () => documentViewLambdaInstance;
export const documentSendNotificationsLambda = () => documentSendNotificationsLambdaInstance;