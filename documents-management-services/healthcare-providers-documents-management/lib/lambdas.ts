
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { resolve, dirname } from 'path';
import { MEDIA_FILES_LOCATIONS, REGION, resourceName } from '../helpers/utilities';
import * as databases from './databases';
import * as s3 from './s3';
import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { addDynamoDbPutPolicy, addS3PutPolicy, createLambdaRole } from './iam';

let validateDocumentLambdaInstance: NodejsFunction;
let uploadLambdaInstance: NodejsFunction;
let sendAuditEventLambdaInstance: NodejsFunction;
let sendEmailLambdaInstance: NodejsFunction;

/**
 * Configuration of Lambda functions
 * @param scope 
 */
export function configureLambdas(scope: Construct, lambdaFolder: string) {
    const uploadLambdaIamRole = createLambdaRole(scope, 'upload-documents-lbd-role');
    addDynamoDbPutPolicy(uploadLambdaIamRole, databases.DatabasesNames.DOCUMENTS_METADATA);
    addS3PutPolicy(uploadLambdaIamRole, s3.BucketsNames.DOCUMENTS_BUCKET);
    uploadLambdaInstance = new NodejsFunction(scope, resourceName('upload-documents'), {
        functionName: resourceName('upload-documents'),
        description: 'Upload documents into S3 bucket and metadata into DynamoDB',
        entry: resolve(dirname(__filename), `${lambdaFolder}/upload-documents.ts`),
        memorySize: 256,
        timeout: Duration.minutes(3),
        handler: 'handler',
        //logGroup: logs.group,
        role: uploadLambdaIamRole,
        environment: {
            REGION: REGION,
            BUCKET_NAME: s3.BucketsNames.DOCUMENTS_BUCKET,
            METADATA_TABLE: databases.DatabasesNames.DOCUMENTS_METADATA
        },
    });
    const auditLambdaIamRole = createLambdaRole(scope, 'send-audit-event-lbd-role');
    addDynamoDbPutPolicy(auditLambdaIamRole, databases.DatabasesNames.AUDIT);
    sendAuditEventLambdaInstance = new NodejsFunction(scope, resourceName('send-audit-event'), {
        functionName: resourceName('send-audit-event'),
        description: 'Saves record about activty in the audit event',
        entry: resolve(dirname(__filename), `${lambdaFolder}/send-audit-event.ts`),
        memorySize: 256,
        timeout: Duration.minutes(3),
        handler: 'handler',
        role: auditLambdaIamRole,
        environment: {
            REGION: REGION,
            AUDIT_TABLE: databases.DatabasesNames.AUDIT
        },
    });
    sendEmailLambdaInstance = new NodejsFunction(scope, resourceName('send-email'), {
        functionName: resourceName('send-email'),
        description: 'Send email to specified email that upload of the documents has been completed',
        entry: resolve(dirname(__filename), `${lambdaFolder}/send-upload-document-emails.ts`),
        memorySize: 256,
        timeout: Duration.minutes(3),
        handler: 'handler',
        environment: {
            REGION: REGION,
            EMAIL_FROM: process.env.EMAIL_FROM || "",
            EMAIL_REPLY_TO: process.env.EMAIL_REPLY_TO || "",
            EMAIL_SMTP_HOST: process.env.EMAIL_SMTP_HOST || "",
            EMAIL_SMTP_PORT: process.env.EMAIL_SMTP_PORT || "",
            EMAIL_SMTP_USERNAME: process.env.EMAIL_SMTP_USERNAME || "",
            EMAIL_SMTP_PASSWORD: process.env.EMAIL_SMTP_PASSWORD || "",
            EMAIL_SMTP_IS_SECURE: process.env.EMAIL_SMTP_IS_SECURE || "",
            EMAILS_MEDIA_PATH: `https://${s3.BucketsNames.EMAILS_MEDIA_BUCKET}.s3.${REGION}.amazonaws.com/${MEDIA_FILES_LOCATIONS.EMAILS_MEDIA_FILES}`
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
export const sendAuditEventLambda = () => sendAuditEventLambdaInstance;
export const sendEmailLambda = () => sendEmailLambdaInstance;
export const validateDocumentLambda = () => validateDocumentLambdaInstance;

