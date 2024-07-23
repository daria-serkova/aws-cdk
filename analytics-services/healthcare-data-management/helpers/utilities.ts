
import { config } from 'dotenv';
config();

export const IS_PRODUCTION = process.env.TAG_ENVIRONMENT === 'production';
/**
 * Pattern for resources names to keep consistency across all application resources.
 */
 export const AWS_RESOURCES_NAMING_CONVENTION = `${process.env.AWS_RESOURCES_NAME_PREFIX}-$-${process.env.TAG_ENVIRONMENT}`;