import { v4 as uuidv4 } from 'uuid';
/**
 * Generates a unique UUID value.
 * @returns {string} - A UUID string representing a unique identifier for the dynamoDB record or for S3 object.
 */
 export function generateUUID(): string {
    return uuidv4();
}