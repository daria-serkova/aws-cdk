import { config } from 'dotenv';
config(); 
/**
 * Pattern for API Gateway Request models.
 */
export const AWS_REQUEST_MODEL_NAMING_CONVENTION = `${process.env.TAG_APPLICATION_CODE?.replace(
    /-/g,
    ""
)}`;

  /**
 * Pattern for resources names to keep consistency across all application resources.
 */
const AWS_RESOURCES_NAMING_CONVENTION = `${process.env.AWS_RESOURCES_NAME_PREFIX}-$-${process.env.TAG_ENVIRONMENT}`;

/**
 * Creates name for AWS resource, that match company's naming convention.
 */
function resourceName(value: string) {
    return AWS_RESOURCES_NAMING_CONVENTION.replace('$', value);
}

/**
 * File is used for exporting resource names to be passed between AWS resource definitions during creation.
 */
export const ResourceName = {
    cloudWatch: {
        DOCUMENT_OPERATIONS_LOGS_GROUP: resourceName('document-operations-log-group'),
        DOCUMENT_WORKFLOW_LOGS_GROUP: resourceName('document-workflow-log-group'),
        DOCMENT_NOTIFICATIONS_LOGS_GROUP: resourceName('document-notifications-log-group'),
        DOCUMENT_AUDIT_LOGS_GROUP: resourceName('document-audit-log-group'),
    },
    s3Buckets: {
        DOCUMENTS_BUCKET: resourceName('documents-bucket').toLowerCase(),
    },
    apiGateway: {
        DOCUMENTS_SERVCIE_GATEWAY: resourceName('documents-api'),
        DOCUMENTS_SERVCIE_API_USAGE_PLAN: resourceName('documents-api-usage-plan'),
        DOCUMENTS_SERVCIE_API_KEY: resourceName('documents-api-key'),
        DOCUMENTS_SERVCIE_API_REQUEST_VALIDATOR: resourceName('documents-api-request-validator'),
        
        DOCUMENTS_SERVCIE_REQUEST_MODEL_DOCUMENT_UPLOAD_BASE64: `${AWS_REQUEST_MODEL_NAMING_CONVENTION}DocumentUploadBase64`,
        DOCUMENTS_SERVCIE_REQUEST_MODEL_DOCUMENT_GET_DETAILS: `${AWS_REQUEST_MODEL_NAMING_CONVENTION}DocumentGetDetails`,
        DOCUMENTS_REQUEST_MODEL_GET_LIST_STATUS: `${AWS_REQUEST_MODEL_NAMING_CONVENTION}DocumentGetListStatus`,
        DOCUMENTS_REQUEST_MODEL_GET_LIST_OWNER: `${AWS_REQUEST_MODEL_NAMING_CONVENTION}DocumentGetListOwner`,

        AUDIT_REQUEST_MODEL_GET_EVENTS: `${AWS_REQUEST_MODEL_NAMING_CONVENTION}AuditGetEvents`,
    },
    iam: {
        // Lambdas roles
        DOCUMENT_VALIDATE_BASE64: resourceName('document-validate-base64-lbd-role'),
        DOCUMENT_UPLOAD_BASE64: resourceName('document-upload-base64-lbd-role'),
        DOCUMENT_UPLOAD_METADATA: resourceName('document-upload-metadata-lbd-role'),
        DOCUMENT_GENERATE_PRESIGNED_URL: resourceName('document-generate-url-lbd-role'),
        DOCUMENT_GET_METADATA: resourceName('document-get-metadata-lbd-role'),
        DOCUMENT_GET_LIST_BY_STATUS: resourceName('document-get-list-status-lbd-role'),
        DOCUMENT_GET_LIST_BY_OWNER: resourceName('document-get-list-owner-lbd-role'),

        AUDIT_STORE_EVENT: resourceName('store-audit-event-lbd-role'),
        AUDIT_GET_EVENTS: resourceName('get-audit-events-lbd-role'),
        
        
        NOTIFICATIONS_SEND: resourceName('notifications-send-lbd-role'),
        ERRORS_HANDLING: resourceName('errors-handling-lbd-role'),
        // ---------------- 
        WORKFLOW_DOCUMENT_UPLOAD_BASE64: resourceName('workflow-upload-b64-document-sm-role'),
        WORKFLOW_DOCUMENT_GET_DETAILS: resourceName('workflow-get-document-details-sm-role'),

        API_GATEWAY_ROLE: resourceName('api-gateway-role'),
    },
    lambdas: {
        DOCUMENT_VALIDATE_BASE64: resourceName('document-validate-base64-lbd'),
        DOCUMENT_UPLOAD_BASE64: resourceName('document-upload-base64-lbd'),
        DOCUMENT_UPLOAD_METADATA: resourceName('document-upload-metadata-lbd'),
        DOCUMENT_GENERATE_PRESIGNED_URL: resourceName('document-generate-url-lbd'),
        DOCUMENT_GET_METADATA: resourceName('document-get-metadata-lbd'),
        DOCUMENT_GET_LIST_BY_STATUS: resourceName('document-get-list-status-lbd'),
        DOCUMENT_GET_LIST_BY_OWNER: resourceName('document-get-list-owner-lbd'),

        
        NOTIFICATIONS_SEND: resourceName('notifications-send-lbd'),
        ERRORS_HANDLING: resourceName('errors-handling-lbd'),

        AUDIT_STORE_EVENT: resourceName('store-audit-event-lbd'),
        AUDIT_GET_EVENTS: resourceName('get-audit-events-lbd'),
    },
    dynamoDbTables: {
        DOCUMENTS_METADATA: resourceName('documents-metadata'),
        DOCUMENTS_METADATA_INDEX_STATUS: resourceName('documents-metadata-by-status'),
        DOCUMENTS_METADATA_INDEX_DOCUMENT_OWNER: resourceName('documents-metadata-by-owner'),
        
        DOCUMENTS_AUDIT: resourceName('documents-audit'),
        DOCUMENTS_AUDIT_INDEX_EVENT_INITIATOR: resourceName('documents-audit-by-event-initiator'),
        DOCUMENTS_AUDIT_INDEX_DOCUMENT_ID: resourceName('documents-audit-by-document-id'),

        DOCUMENTS_VERIFICATION: resourceName('documents-verification'),
        DOCUMENTS_VERIFICATION_INDEX_DOCUMENT_ID: resourceName('documents-verification-by-document-id'),
    },
    stateMachines: {
        
        
        WORKFLOW_DOCUMENT_UPLOAD_BASE64: resourceName('workflow-upload-b64-document-sm'),
        
        WF_UPLOAD_TASK_VALIDATE_BASE64_DOCUMENT: resourceName('wf-upload-task-validate-b64-document'),
        WF_UPLOAD_TASK_ADD_BASE64_DOCUMENT: resourceName('wf-upload-task-add-b64-document'),
        WF_UPLOAD_TASK_ADD_METADATA: resourceName('wf-upload-task-add-metadata'),
        WF_UPLOAD_TASK_STORE_AUDIT_EVENT: resourceName('wf-upload-task-record-audit'),
        WF_UPLOAD_FAILED_STATE_BASE64_VALIDATION: resourceName('wf-upload-task-failed-b64-validation'),


        WORKFLOW_DOCUMENT_GET_DETAILS: resourceName('workflow-get-document-details-sm'),
        WF_GET_DETAILS_TASK_GET_METADATA: resourceName('wf-get-details-task-get-metadata'),
        WF_GET_DETAILS_TASK_GET_URL: resourceName('wf-get-details-task-get-url'),
        WF_GET_DETAILS_TASK_STORE_AUDIT_EVENT: resourceName('wf-get-details-task-record-audit'),

        
    }
}