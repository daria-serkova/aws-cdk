
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { resolve, dirname } from 'path';
import { REGION, resourceName } from '../helpers/utilities';
import { getAuditTable, getFilesMetadataTable } from './databases';

let uploadLambdaInstance: NodejsFunction;
let sendAuditEventLambdaInstance: NodejsFunction;
let sendEmailLambdaInstance: NodejsFunction;
let validateDocumentLambdaInstance: NodejsFunction;
let updateMetadataLambdaInstance: NodejsFunction;
let filesMetadataTable = getFilesMetadataTable();
let auditTable = getAuditTable();

export function configureLambdas(scope: Construct, lambdaFolder: string) {
    uploadLambdaInstance = new NodejsFunction(scope, resourceName('upload-documents'), {
        functionName: resourceName('upload-documents'),
        description: 'Upload documents into S3 bucket',
        entry: resolve(dirname(__filename), `${lambdaFolder}/upload-documents.ts`),
        memorySize: 256,
        timeout: Duration.minutes(3),
        handler: 'handler',
        //logGroup: logs.group,
        //role: iamRole,
        environment: {
            REGION: REGION,
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
            DB_METADATA_TABLE: filesMetadataTable?.tableName || ''
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
            DB_AUDIT_TABLE: auditTable?.tableName || ''
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

