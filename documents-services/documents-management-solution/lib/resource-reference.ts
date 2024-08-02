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
        DOCUMENT_ADMINISTRATION_LOGS_GROUP: resourceName('document-administration-log-group'),
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
        DOCUMENTS_SERVCIE_REQUEST_MODEL_DOCUMENT_VIEW: `${AWS_REQUEST_MODEL_NAMING_CONVENTION}DocumentView`,
    },
    iam: {
        // Lambdas roles
        DOCUMENT_VALIDATE_BASE64: resourceName('document-validate-base64-lbd-role'),
        DOCUMENT_UPLOAD_BASE64: resourceName('document-upload-base64-lbd-role'),
        DOCUMENT_UPLOAD_METADATA: resourceName('document-upload-metadata-lbd-role'),
        DOCUMENT_GENERATE_PRESIGNED_URL: resourceName('document-generate-url-lbd-role'),
        AUDIT_STORE_EVENT: resourceName('store-audit-event-lbd-role'),
        NOTIFICATIONS_SEND: resourceName('notifications-send-lbd-role'),
        ERRORS_HANDLING: resourceName('errors-handling-lbd-role'),
        // ---------------- 
        WORKFLOW_DOCUMENT_UPLOAD_BASE64: resourceName('workflow-upload-b64-document-sm-role'),
        //DOCUMENT_VIEW_STATE_MANCHINE: resourceName('document-view-sm-role'),

        API_GATEWAY_ROLE: resourceName('api-gateway-role'),
    },
    lambdas: {
        DOCUMENT_VALIDATE_BASE64: resourceName('document-validate-base64-lbd'),
        DOCUMENT_UPLOAD_BASE64: resourceName('document-upload-base64-lbd'),
        DOCUMENT_UPLOAD_METADATA: resourceName('document-upload-metadata-lbd'),
        DOCUMENT_GENERATE_PRESIGNED_URL: resourceName('document-generate-url-lbd'),
        AUDIT_STORE_EVENT: resourceName('store-audit-event-lbd'),
        NOTIFICATIONS_SEND: resourceName('notifications-send-lbd'),
        ERRORS_HANDLING: resourceName('errors-handling-lbd'),
    },
    dynamoDbTables: {
        DOCUMENTS_METADATA: resourceName('documents-metadata'),
        DOCUMENTS_AUDIT: resourceName('documents-audit'),
        DOCUMENTS_AUDIT_INDEX_EVENT_INITIATOR: resourceName('documents-audit-by-event-initiator'),
    },
    stateMachines: {
        WORKFLOW_DOCUMENT_UPLOAD_BASE64: resourceName('workflow-upload-b64-document-sm'),
        //DOCUMENT_VIEW_STATE_MANCHINE: resourceName('document-view-sm'),

        TASK_VALIDATE_BASE64_DOCUMENT: resourceName('validate-b64-document-task'),
        TASK_UPLOAD_BASE64_DOCUMENT: resourceName('upload-b64-document-task'),
        TASK_UPLOAD_DOCUMENT_METADATA: resourceName('upload-document-meta-task'),
        TASK_STORE_AUDIT_EVENT: resourceName('store-audit-event-task'),
        TASK_ERRORS_HANDLING_TASK: resourceName('errors-handling-task'),
        FAILED_STATE_DOCUMENT_UPLOAD_VALIDATION: resourceName('failed-document-upload-validation'),
    }
}