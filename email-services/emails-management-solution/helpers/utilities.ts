import { config } from 'dotenv';
config();
/**
 * Identifies envrironment of the deployment to minimize AWS cost for non-production environments.
 */
export const isProduction = process.env.TAG_ENVIRONMENT === 'production';

export const s3BucketStructure = {
    EMAILS_MEDIA_FILES_LOCATION: 'media-files',
    EMAILS_TEMPLATES_LOCATION: 'templates',
    EMAILS_LOGS_LOCATION: 'logs',
}