
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { resolve, dirname } from 'path';
import { addCloudWatchPutPolicy, addDynamoDbPutPolicy, addS3PutPolicy, createLambdaRole } from './iam';
import { ResourceName } from '../resource-reference';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { s3BucketStructure } from '../../helpers/utilities';

const lambdaFilesLocation = '../../functions';

let templateUpdateLambdaInstance: NodejsFunction;
let deliverySendLambdaInstance: NodejsFunction;

/**
 * Configuration of Lambda functions
 * @param scope 
 */
export function configureLambdaResources(scope: Construct, logGroups: {
    templatesManagementLogsGroup: LogGroup,
    deliveryLogsGroup: LogGroup,
    reportsLogsGroup: LogGroup
}) {
    const templateUpdateLambdaIamRole = createLambdaRole(scope, ResourceName.iam.EMAIL_TEMPLATE_UPDATE_LAMBDA);
    addCloudWatchPutPolicy(templateUpdateLambdaIamRole, ResourceName.cloudWatch.TEMPLATES_MANAGEMENT_LOGS_GROUP);   
    addS3PutPolicy(templateUpdateLambdaIamRole, ResourceName.s3Buckets.EMAIL_BUCKET);
    templateUpdateLambdaInstance = new NodejsFunction(scope, 
        ResourceName.lambdas.EMAIL_TEMPLATE_UPDATE, 
        {
            functionName: ResourceName.lambdas.EMAIL_TEMPLATE_UPDATE,
            description: 'Updates email template file inside S3 bucket, based on passed JSON data',
            entry: resolve(dirname(__filename), `${lambdaFilesLocation}/email-template-update.ts`),
            memorySize: 256,
            timeout: Duration.minutes(3),
            handler: 'handler',
            logGroup: logGroups.templatesManagementLogsGroup,
            role: templateUpdateLambdaIamRole,
            environment: {
                REGION: process.env.AWS_REGION || '',
                BUCKET_NAME: ResourceName.s3Buckets.EMAIL_BUCKET,
                BUCKET_TEMPLATES_LOCATION: s3BucketStructure.EMAILS_TEMPLATES_LOCATION
            },
        }     
    );


    const deliverySendLambdaIamRole = createLambdaRole(scope, ResourceName.iam.EMAIL_DELIVERY_SEND_EMAIL_LAMBDA);
    addCloudWatchPutPolicy(deliverySendLambdaIamRole, ResourceName.cloudWatch.DELIVERY_LOGS_GROUP); 
    addDynamoDbPutPolicy(deliverySendLambdaIamRole, ResourceName.dynamoDbTables.EMAIL_LOGS);
    addS3PutPolicy(deliverySendLambdaIamRole, ResourceName.s3Buckets.EMAIL_BUCKET);
    deliverySendLambdaInstance = new NodejsFunction(scope, 
        ResourceName.lambdas.EMAIL_DELIVERY_SEND, 
        {
            functionName: ResourceName.lambdas.EMAIL_DELIVERY_SEND,
            description: 'Sends branded email to the user, based on the passed JSON data',
            entry: resolve(dirname(__filename), `${lambdaFilesLocation}/email-send.ts`),
            memorySize: 256,
            timeout: Duration.minutes(3),
            handler: 'handler',
            logGroup: logGroups.deliveryLogsGroup,
            role: deliverySendLambdaIamRole,
            environment: {
                REGION: process.env.AWS_REGION || '',
                BUCKET_NAME: ResourceName.s3Buckets.EMAIL_BUCKET,
                LOGS_TABLE_NAME: ResourceName.dynamoDbTables.EMAIL_LOGS,
            },
        }     
    );
}

export const templateUpdateLambda = () => templateUpdateLambdaInstance;
export const deliverySendLambda = () => deliverySendLambdaInstance;
