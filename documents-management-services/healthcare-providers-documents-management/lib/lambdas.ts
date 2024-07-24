
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { resolve, dirname } from 'path';
import { REGION, resourceName } from '../helpers/utilities';
import * as databases from './databases';
import * as s3 from './s3';
import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

let uploadLambdaInstance: NodejsFunction;
let sendAuditEventLambdaInstance: NodejsFunction;
let sendEmailLambdaInstance: NodejsFunction;
let validateDocumentLambdaInstance: NodejsFunction;
let updateMetadataLambdaInstance: NodejsFunction;

let bucket = s3.documentsBucket();
/**
 * Configuration of Lambda functions
 * @param scope 
 */
export function configureLambdas(scope: Construct, lambdaFolder: string) {
    const iamRole = new Role(scope, resourceName('upload-lambda-role'), {
        roleName: resourceName('upload-lambda-role'),
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      });
      iamRole.addToPolicy(new PolicyStatement({
        actions: [
            's3:PutObject',
            's3:PutObjectAcl',
            's3:GetObject',
            's3:ListBucket',
            'dynamodb:PutItem'
        ],
        resources: [
            `arn:aws:s3:::${bucket}`, 
            `arn:aws:s3:::${bucket}/*`, 
            `arn:aws:dynamodb:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT}:table/${databases.DatabasesNames.DOCUMENTS_METADATA}`
            
        ],
    }));
    uploadLambdaInstance = new NodejsFunction(scope, resourceName('upload-documents'), {
        functionName: resourceName('upload-documents'),
        description: 'Upload documents into S3 bucket',
        entry: resolve(dirname(__filename), `${lambdaFolder}/upload-documents.ts`),
        memorySize: 256,
        timeout: Duration.minutes(3),
        handler: 'handler',
        //logGroup: logs.group,
        role: iamRole,
        environment: {
            REGION: REGION,
            BUCKET_NAME: bucket,
            METADATA_TABLE: databases.DatabasesNames.DOCUMENTS_METADATA
        },
    });
    updateMetadataLambdaInstance = new NodejsFunction(scope, resourceName('update-metadata'), {
        functionName: resourceName('update-metadata'),
        description: 'Updates record in DynamoDB that contains metadata about uploaded document',
        entry: resolve(dirname(__filename), `${lambdaFolder}/update-metadata.ts`),
        memorySize: 256,
        timeout: Duration.minutes(3),
        handler: 'handler',
        environment: {
            REGION: REGION,
            DB_METADATA_TABLE: databases.DatabasesNames.DOCUMENTS_METADATA
        },
    });
    sendAuditEventLambdaInstance = new NodejsFunction(scope, resourceName('send-audit-event'), {
        functionName: resourceName('send-audit-event'),
        description: 'Saves record about activty in the audit event',
        entry: resolve(dirname(__filename), `${lambdaFolder}/send-audit-event.ts`),
        memorySize: 256,
        timeout: Duration.minutes(3),
        handler: 'handler',
        environment: {
            REGION: REGION,
            DB_AUDIT_TABLE: databases.DatabasesNames.DOCUMENTS_METADATA
        },
    });
    sendEmailLambdaInstance = new NodejsFunction(scope, resourceName('send-email'), {
        functionName: resourceName('send-email'),
        description: 'Send email to specified email that upload of the documents has been completed',
        entry: resolve(dirname(__filename), `${lambdaFolder}/send-email.ts`),
        memorySize: 256,
        timeout: Duration.minutes(3),
        handler: 'handler',
        environment: {
            REGION: REGION,
        },
    });
    validateDocumentLambdaInstance = new NodejsFunction(scope, resourceName('validate-document'), {
        functionName: resourceName('validate-document'),
        description: 'Checks if the document meets certain criteria before uploading.',
        entry: resolve(dirname(__filename), `${lambdaFolder}/validate-document.ts`),
        memorySize: 256,
        timeout: Duration.minutes(3),
        handler: 'handler',
        environment: {
            REGION: REGION,
        },
    });
}
export const uploadLambda = () => uploadLambdaInstance;
export const updateMetadataLambda = () => updateMetadataLambdaInstance;
export const sendAuditEventLambda = () => sendAuditEventLambdaInstance;
export const sendEmailLambda = () => sendEmailLambdaInstance;
export const validateDocumentLambda = () => validateDocumentLambdaInstance;

