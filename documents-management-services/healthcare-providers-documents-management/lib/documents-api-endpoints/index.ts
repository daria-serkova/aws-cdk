import { Construct } from 'constructs';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import uploadDocumentAction from './upload';

const lambdasFolder = '../../functions/documents-api';

export default function configureDocumentsApiResources(scope: Construct, logs: { group?: LogGroup; policy: any }) {
    uploadDocumentAction(scope, lambdasFolder, logs);
}