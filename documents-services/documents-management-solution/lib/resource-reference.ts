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
        DOCUMENT_OPERATIONS_LOGS_GROUP: resourceName('document-operations'),
        DOCUMENT_WORKFLOW_LOGS_GROUP: resourceName('document-workflow'),
        DOCMENT_NOTIFICATIONS_LOGS_GROUP: resourceName('document-notifications'),
        DOCUMENT_ADMINISTRATION_LOGS_GROUP: resourceName('document-administration'),
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
    },
    iam: {
        DOCUMENT_UPLOAD_BASE64_LAMBDA: resourceName('document-upload-base64-lbd-role'),
    },
    lambdas: {
        DOCUMENT_UPLOAD_BASE64: resourceName('document-upload-base64'),
    },
    dynamoDbTables: {
        DOCUMENTS_METADATA: resourceName('documents-metadata'),
    },
   
    
    
   
}