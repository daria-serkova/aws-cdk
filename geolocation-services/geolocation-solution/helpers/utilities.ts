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
/**
 * List of supported countries for the application.
 * The country codes listed here must match the values provided by the GeoNames API.
 * This ensures consistency and accurate data retrieval when interacting with GeoNames.
 */
export const SupportedCountries : string [] = [
    'US', // United States
    'IN', // India
    'CA', // Canada
    'RU', // Russia 
];
/**
 * List of supported languages for the application.
 * The language codes listed here must match the values provided by the GeoNames API.
 * This ensures consistency and accurate data retrieval when interacting with GeoNames.
 */
export const SupportedLanguages : string [] = [
    'en', // English
    'hi', // Hindi
    'ru', // Russian
    'fr', // French
];
 // Sort by the "label" values alphabetically
export const filterByLabel = (filteredItems: any[]) => {
     filteredItems.sort((a, b) => {
        const valueA = a.label.toLowerCase();
        const valueB = b.label.toLowerCase();
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    });
    return filteredItems;
}