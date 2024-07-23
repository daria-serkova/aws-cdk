import { Construct } from 'constructs';
import uploadDocumentAction from './upload';
import getDocumentAction from './get-document';
import getDocumentMetadataAction from './get-metadata';
import getListByUserAction from './get-list-by-user';
import updateDocumentMetadataAction from './update-metadata';
import { ApiResources, LogsResources } from '../../helpers/types';
import getListByStatusAction from './get-list-by-status';
import verifySubmitAction from './verify-submit';
import verifyConfirmAction from './verify-confirm';
import verifyRejectAction from './verify-reject';

const lambdasFolder = '../../../functions/documents-api';
const apiNodeName = 'documents';

export default function configureDocumentsApiResources(
    scope: Construct, 
    logs: LogsResources,
    api: ApiResources
) {
    const versionNode = api.apiGateway.root.getResource(api.apiVersion);
    if (versionNode) {
        const apiNode = versionNode.addResource(apiNodeName);
        uploadDocumentAction(scope, lambdasFolder, logs, api, apiNode);
        getDocumentAction(scope, lambdasFolder, logs, api, apiNode);
        getDocumentMetadataAction(scope, lambdasFolder, logs, api, apiNode);
        getListByUserAction(scope, lambdasFolder, logs, api, apiNode);
        updateDocumentMetadataAction(scope, lambdasFolder, logs, api, apiNode);
        getListByStatusAction(scope, lambdasFolder, logs, api, apiNode);
        verifySubmitAction(scope, lambdasFolder, logs, api, apiNode);
        verifyConfirmAction(scope, lambdasFolder, logs, api, apiNode);
        verifyRejectAction(scope, lambdasFolder, logs, api, apiNode);
        
    }
}