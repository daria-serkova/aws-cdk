import { config } from 'dotenv';
config(); 
// Pattern for resources names to keep consistency across all application resources.
const AWS_RESOURCES_NAMING_CONVENTION : string = `${process.env.AWS_RESOURCES_NAME_PREFIX}-${process.env.TAG_ENVIRONMENT}-$`;
/**
 * Function is used to generate standardized resource names by appending
 * appropriate prefixes or suffixes to the base resource names.
 * @param name - unique AWS resource name
 * @returns string with organization's prefix and unique resource name
 */
 const resourceName = (name: string) : string => AWS_RESOURCES_NAMING_CONVENTION.replace('$', name);

/**
 * ResourceName defines a set of constants used to reference various AWS resources in the application.
 * These constants are used for managing and accessing AWS resources such as Kinesis Firehose streams,
 * IAM roles, Lambda functions, S3 buckets, etc.
 */
export const ResourceName = {
    cloudWatch: {
        AUDIT_EVENTS_FIREHOSE_STREAM_LG: resourceName('audit-events-firehose-stream-lg'),
        AUDIT_EVENTS_FIREHOSE_STREAM_LS: resourceName('audit-events-firehose-stream-ls'),
    },
    iam: {
        AUDIT_EVENTS_FIREHOSE_STREAM: resourceName('audit-events-firehose-stream-role'),
        DATA_STREAM_TRANSFORMATION_LAMBDA: resourceName('data-stream-transformation-lbd-role'),
    },
    lambda: {
        DATA_STREAM_TRANSFORMATION_LAMBDA: resourceName('data-stream-transformation-lbd'),
        
    },
    streaming: {
        AUDIT_EVENTS_FIREHOSE_STREAM: resourceName('audit-events-firehose-stream'),
    },
    s3: {
        AUDIT_EVENTS_STORAGE: resourceName('audit-events-storage').toLowerCase(),
    },
    kms: {
        KMS_KEY:  resourceName('kms'),
    }

};