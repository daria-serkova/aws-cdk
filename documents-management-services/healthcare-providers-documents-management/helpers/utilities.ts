
import { config } from 'dotenv';
config();

export const isProduction = process.env.TAG_ENVIRONMENT === 'production';
export const region = process.env.AWS_REGION || '';
/**
 * Pattern for resources names to keep consistency across all application resources.
 */
 export const awsResourcesNamingConvention = `${process.env.AWS_RESOURCES_NAME_PREFIX}-$-${process.env.TAG_ENVIRONMENT}`;