import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique UUID for a document.
 * The UUID can be used as a unique identifier for documents in the system.
 * 
 * @returns {string} - A UUID string representing a unique identifier for the document.
 */
export function generateDocumentUUID(): string {
    return uuidv4();
}

/**
 * Generates a unique UUID for a audit event.
 * The UUID can be used as a unique identifier for audit events in the system.
 * 
 * @returns {string} - A UUID string representing a unique identifier for the audit event.
 */
 export function generateAuditEventUUID(): string {
    return uuidv4();
}
