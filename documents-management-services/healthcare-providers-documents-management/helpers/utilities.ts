import { config } from 'dotenv';
config();
export const IS_PRODUCTION = process.env.TAG_ENVIRONMENT === 'production';
export const REGION = process.env.AWS_REGION || '';

/**
 * Pattern for resources names to keep consistency across all application resources.
 */
 export const AWS_RESOURCES_NAMING_CONVENTION = `${process.env.AWS_RESOURCES_NAME_PREFIX}-$-${process.env.TAG_ENVIRONMENT}`;

/**
 * Pattern for API Gateway Request models.
 */
 export const AWS_REQUETS_MODELS_NAMING_CONVENTION = `${process.env.TAG_APPLICATION_CODE?.replace(
    /-/g,
    ""
  )}`;

export const VALIDATION_RULES = {
    PATTERN_IP: "^((25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$",
    PATTERN_EMAIL: "^[\\w\\.\\-\\+_]+@[a-zA-Z\\d\\.-]+\\.[a-zA-Z]{2,}$",
};  