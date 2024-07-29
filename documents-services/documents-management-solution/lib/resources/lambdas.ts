
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { resolve, dirname } from 'path';
import { addCloudWatchPutPolicy, addDynamoDbPutPolicy, addS3ReadPolicy, addS3WritePolicy, createLambdaRole } from './iam';
import { ResourceName } from '../resource-reference';
import { LogGroup } from 'aws-cdk-lib/aws-logs';

const lambdaFilesLocation = '../../functions';

let documentUploadBase64LambdaInstance: NodejsFunction;

/**
 * Configuration of Lambda functions
 * @param scope 
 */
export function configureLambdaResources(scope: Construct, logGroups: {
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
            description: 'Uploads base64 document in S3 bucket and saves metadata in DynamoDB',
            entry: resolve(dirname(__filename), `${lambdaFilesLocation}/document-upload-base64.ts`),
            memorySize: 256,
            timeout: Duration.minutes(3),
            handler: 'handler',
            logGroup: logGroups.documentOperations,
            role: documentUploadBase64LambdaIamRole,
            environment: {
                REGION: process.env.AWS_REGION || '',
                BUCKET_NAME: ResourceName.s3Buckets.DOCUMENTS_BUCKET,
                BUCKET_UPLOAD_FOLDER: 'documents/$1/$2/uploaded'
            },
        }     
    );
}

export const documentUploadBase64Lambda = () => documentUploadBase64LambdaInstance;
