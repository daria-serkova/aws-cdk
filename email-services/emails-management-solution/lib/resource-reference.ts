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
    dynamoDbTables: {
        // Store detailed logs of each email sent, including metadata and status.
        EMAIL_LOGS: resourceName('emails-logs'),
    },
    s3Buckets: {
        // Store public media files.
        EMAIL_MEDIA_BUCKET: resourceName('emails-media-bucket').toLowerCase(),
         // Store email templates and sent emails bodies for audit purposes.
        EMAIL_BUCKET: resourceName('emails-bucket').toLowerCase(),
    },
    
    s3Deployments: {
        // Uploads media files, used in the emails, inside S3 bucket.
        EMAIL_BUCKET_MEDIA_FILES_UPLOAD: resourceName('upload-emails-media-files'),
        EMAIL_BUCKET_MEDIA_FILES_UPLOAD_ROLE: resourceName('upload-emails-media-files-role'),
    },
    apiGateway: {
        EMAILS_SERVCIE_GATEWAY: resourceName('emails-api'),
        EMAILS_SERVCIE_API_USAGE_PLAN: resourceName('emails-api-usage-plan'),
        EMAILS_SERVCIE_API_KEY: resourceName('emails-api-key'),
        EMAILS_SERVCIE_API_REQUEST_VALIDATOR: resourceName('emails-api-request-validator'),
        EMAILS_SERVCIE_REQUEST_MODEL_TEMPLATE_UPDATE: `${AWS_REQUEST_MODEL_NAMING_CONVENTION}EmailTemplateUpdate`,
        EMAILS_SERVCIE_REQUEST_MODEL_DELIVERY_SEND: `${AWS_REQUEST_MODEL_NAMING_CONVENTION}EmailSendUpdate`
    },
    lambdas: {
        EMAIL_TEMPLATE_UPDATE: resourceName('email-template-update'),
        EMAIL_DELIVERY_SEND: resourceName('email-send'),
    },
    iam: {
        EMAIL_TEMPLATE_UPDATE_LAMBDA: resourceName('email-template-update-lbd-role'),
        EMAIL_DELIVERY_SEND_EMAIL_LAMBDA: resourceName('email-send-lbd-role'),
    },
    cloudWatch: {
        TEMPLATES_MANAGEMENT_LOGS_GROUP: resourceName('emails-templates-management'),
        DELIVERY_LOGS_GROUP: resourceName('emails-delivery'),
        REPORTS_LOGS_GROUP: resourceName('emails-reports'),
    }
}