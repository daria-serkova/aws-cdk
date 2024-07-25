import { config } from 'dotenv';
config();
export const IS_PRODUCTION = process.env.TAG_ENVIRONMENT === 'production';
export const REGION = process.env.AWS_REGION || '';
export const EMAIL_SETTINGS = {
  EMAIL_FROM: process.env.EMAIL_FROM || "",
  EMAIL_REPLY_TO: process.env.EMAIL_REPLY_TO || "",
  EMAIL_SMTP_HOST: process.env.EMAIL_SMTP_HOST || "",
  EMAIL_SMTP_PORT: process.env.EMAIL_SMTP_PORT || "",
  EMAIL_SMTP_USERNAME: process.env.EMAIL_SMTP_USERNAME || "",
  EMAIL_SMTP_PASSWORD: process.env.EMAIL_SMTP_PASSWORD || "", //TBD: move to secure storage
  EMAIL_SMTP_IS_SECURE: process.env.EMAIL_SMTP_IS_SECURE || "",
}

/**
 * Pattern for resources names to keep consistency across all application resources.
 */
export const AWS_RESOURCES_NAMING_CONVENTION = `${process.env.AWS_RESOURCES_NAME_PREFIX}-$-${process.env.TAG_ENVIRONMENT}`;

export function resourceName(value: string) {
  return AWS_RESOURCES_NAMING_CONVENTION.replace('$', value)
}

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

export const MEDIA_FILES_LOCATIONS = {
  EMAILS_MEDIA_FILES: 'public/emails'
}