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
        LIFECYCLE_RULES: {
            ARCHIVE_AND_REMOVE_UPLOADED_DOCUMENTS: resourceName('$1-upload-archive-remove-lc'),
            ARCHIVE_AND_REMOVE_VERIFIED_DOCUMENTS: resourceName('$1-verified-archive-remove-lc'),
            ARCHIVE_AND_REMOVE_REJECTED_DOCUMENTS: resourceName('$1- rejected-archive-remove-lc'),
        }
    },
    dynamoDbTables: {
        /* 
         * $1 and $2 will be dynamically replaced based on document type for which requests are conducted (insurance, billing, etc)
         * $1 represents type of table (metadata, audit, etc). 
         * $2 represents index suffix 
         */
        DOCUMENT_TYPES_TABLES: {
            PROVIDERS: resourceName('providers-documents-$1$2'),
            INSURANCE: resourceName('insurance-documents-$1$2'),
            BILLING: resourceName('billing-documents-$1$2'),
            CONSENT_FORMS: resourceName('consent-forms-documents-$1$2'),
            PATIENTS: resourceName('patients-documents-$1$2'),
        },
        INDEX_NAMES_SUFFIXES: {
            DOCUMENT_ID_AND_STATUS: 'index-doc-id-and-status',
            DOCUMENT_ID: 'index-doc-id',
            //Audit indexes
            DOCUMENT_ID_AND_EVENT_INITIATOR: 'index-doc-id-and-event-initiator',
            EVENT_INITIATOR_AND_DOC_ID: 'index-event-initiator-and-doc-id',
            STATUS_AND_OWNER: 'index-status-and-owner',
            OWNER: 'index-owner',
        }
    },
    apiGateway: {
        DOCUMENTS_SERVCIE_GATEWAY: resourceName('documents-api'),
        DOCUMENTS_SERVCIE_API_USAGE_PLAN: resourceName('documents-api-usage-plan'),
        DOCUMENTS_SERVCIE_API_KEY: resourceName('documents-api-key'),
        DOCUMENTS_SERVCIE_API_REQUEST_VALIDATOR: resourceName('documents-api-request-validator'),
        
        DOCUMENTS_SERVCIE_REQUEST_MODEL_DOCUMENT_UPLOAD_BASE64: `${AWS_REQUEST_MODEL_NAMING_CONVENTION}DocumentUploadBase64`,
        DOCUMENTS_REQUEST_MODEL_DOCUMENT_UPLOAD: `${AWS_REQUEST_MODEL_NAMING_CONVENTION}DocumentUpload`,
        DOCUMENTS_REQUEST_MODEL_DOCUMENT_GET_DETAILS: `${AWS_REQUEST_MODEL_NAMING_CONVENTION}DocumentGetDetails`,
        DOCUMENTS_REQUEST_MODEL_DOCUMENT_GET_URL: `${AWS_REQUEST_MODEL_NAMING_CONVENTION}DocumentGetUrl`,
        DOCUMENTS_REQUEST_MODEL_DOCUMENT_GET_METADATA: `${AWS_REQUEST_MODEL_NAMING_CONVENTION}DocumentGetMetadata`,
        DOCUMENTS_REQUEST_MODEL_GET_LIST_STATUS: `${AWS_REQUEST_MODEL_NAMING_CONVENTION}DocumentGetListStatus`,
        DOCUMENTS_REQUEST_MODEL_GET_LIST_OWNER: `${AWS_REQUEST_MODEL_NAMING_CONVENTION}DocumentGetListOwner`,

        VERIFY_REQUEST_MODEL_UPDATE_TRAIL: `${AWS_REQUEST_MODEL_NAMING_CONVENTION}VerifyUpdateTrail`,

        AUDIT_REQUEST_MODEL_GET_EVENTS: `${AWS_REQUEST_MODEL_NAMING_CONVENTION}AuditGetEvents`,
    },
    iam: {
        /* Lambdas roles */
        DOCUMENT_GENERATE_PRESIGN_UPLOAD_URLS: resourceName('document-generate-upload-urls-lbd-role'),
        DOCUMENT_S3_UPLOAD_LISTENER: resourceName('document-s3-upload-listener-lbd-role'),
        DOCUMENT_GET_LIST_BY_STATUS: resourceName('document-get-list-status-lbd-role'),
        DOCUMENT_GET_LIST_BY_OWNER: resourceName('document-get-list-owner-lbd-role'),
        DOCUMENT_GENERATE_PRESIGNED_URL: resourceName('document-generate-url-lbd-role'),
        DOCUMENT_UPLOAD_METADATA: resourceName('document-upload-metadata-lbd-role'),
        DOCUMENT_GET_METADATA: resourceName('document-get-metadata-lbd-role'),
        
        AUDIT_STORE_EVENT: resourceName('store-audit-event-lbd-role'),
        AUDIT_GET_EVENTS: resourceName('get-audit-events-lbd-role'),
        
        VERIFY_UPDATE_TRAIL: resourceName('verify-update-trail-lbd-role'),
        /* Step Functions roles */
        WORKFLOW_VERIFY_DOCUMENT: resourceName('workflow-verify-doc-sm-role'),
        WORKFLOW_DOCUMENT_UPLOAD: resourceName('workflow-upload-document-sm-role'),
        WORKFLOW_DOCUMENT_GET_DETAILS: resourceName('workflow-get-document-details-sm-role'),
        WORKFLOW_DOCUMENT_GET_URL: resourceName('workflow-get-document-url-sm-role'),
        WORKFLOW_DOCUMENT_GET_METADATA: resourceName('workflow-get-document-metadata-sm-role'),
        /* API Gateway roles */
        API_GATEWAY_ROLE: resourceName('api-gateway-role'),
    },
    lambdas: {
        DOCUMENT_GENERATE_PRESIGN_UPLOAD_URLS: resourceName('document-generate-upload-urls-lbd'),
        DOCUMENT_S3_UPLOAD_LISTENER: resourceName('document-s3-upload-listener-lbd'),
        DOCUMENT_GET_LIST_BY_STATUS: resourceName('document-get-list-status-lbd'),
        DOCUMENT_GET_LIST_BY_OWNER: resourceName('document-get-list-owner-lbd'),
        DOCUMENT_GENERATE_PRESIGNED_URL: resourceName('document-generate-url-lbd'),
        DOCUMENT_UPLOAD_METADATA: resourceName('document-upload-metadata-lbd'), 
        DOCUMENT_GET_METADATA: resourceName('document-get-metadata-lbd'),
        AUDIT_STORE_EVENT: resourceName('store-audit-event-lbd'),
        AUDIT_GET_EVENTS: resourceName('get-audit-events-lbd'),
        VERIFY_UPDATE_TRAIL: resourceName('verify-update-trail-lbd'),
    },
    
    stateMachines: {
        /* Get document details */
        WORKFLOW_DOCUMENT_GET_DETAILS: resourceName('workflow-get-document-details-sm'),
        WF_GET_DETAILS_TASK_GET_METADATA: resourceName('wf-get-details-task-get-metadata'),
        WF_GET_DETAILS_TASK_GET_URL: resourceName('wf-get-details-task-get-url'),
        WF_GET_DETAILS_TASK_STORE_AUDIT_EVENT: resourceName('wf-get-details-task-record-audit'),
        /* Get document url */
        WORKFLOW_DOCUMENT_GET_URL: resourceName('workflow-get-doc-url-sm'),
        WF_GET_URL_TASK_GENERATE_URL: resourceName('wf-get-doc-url-task-generate-url'),
        WF_GET_URL_TASK_STORE_AUDIT_EVENT: resourceName('wf-get-doc-url-task-record-audit'),
        /* Get document metadata */
        WORKFLOW_DOCUMENT_GET_META: resourceName('workflow-get-doc-meta-sm'),
        WF_GET_METADATA_TASK_RETRIEVE_META: resourceName('wf-get-doc-meta-task-retrieve-data'),
        WF_GET_METADATA_TASK_STORE_AUDIT_EVENT: resourceName('wf-get-doc-meta-task-record-audit'),

        /* Verify document workflow */
        WORKFLOW_VERIFY_DOCUMENT: resourceName('workflow-verify-doc-sm'),
        WF_VERIFY_TASK_GET_METADATA: resourceName('wf-verify-doc-task-get-metadata'),
        WF_VERIFY_TASK_UPDATE_TRAIL: resourceName('wf-verify-doc-task-update-trail'),
        WF_VERIFY_TASK_UPDATE_METADATA: resourceName('wf-verify-doc-task-update-metadata'),
        WF_VERIFY_TASK_STORE_AUDIT_EVENT: resourceName('wf-verify-doc-task-record-audit'),
    }
}

export const metadataTables = (): string[] => {
    return Object.values(ResourceName.dynamoDbTables.DOCUMENT_TYPES_TABLES).map(name => name.replace('$1', 'metadata'));
};

export const auditTables = (): string[] => {
    return Object.values(ResourceName.dynamoDbTables.DOCUMENT_TYPES_TABLES).map(name => name.replace('$1', 'audit'));
}
export const verificationTables = (): string[] => {
    return Object.values(ResourceName.dynamoDbTables.DOCUMENT_TYPES_TABLES).map(name => name.replace('$1', 'verification'));
}