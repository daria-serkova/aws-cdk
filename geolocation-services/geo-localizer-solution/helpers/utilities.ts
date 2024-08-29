import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
config();

/**
 * Identifies envrironment of the deployment to minimize AWS cost for non-production environments.
 */
export const isProduction = process.env.TAG_ENVIRONMENT === 'production';
/**
 * Generates a unique UUID value.
 * @returns {string} - A UUID string representing a unique identifier for the business entity.
 */
export const generateUUID = (): string => uuidv4();
/**
 * Generates current date in unified format across application.
 * @returns {string} - timestamp value.
 */
export const getCurrentTime = (): string => new Date().getTime().toString();
/**
 * Generates a unique UUID value with length of 8 characters.
 * @returns {string} - A UUID string representing a unique identifier for name's suffix.
 */
 export const generateUUIDNameSuffix = (): string => {
    const uuid = uuidv4().replace(/-/g, '');
    return uuid.substring(0, 6);
};
export const SupportedParamsPatterns = {
    IP: "^((25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$"
}
export const SupportedLanguages = ['en', 'hi', 'ru', 'fr'];