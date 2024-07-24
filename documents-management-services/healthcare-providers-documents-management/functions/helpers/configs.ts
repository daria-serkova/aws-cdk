import { Document } from './types';
/**
 * List of required fields for a Document type.
 * These fields must be present and non-empty in a valid Document.
 */
export const RequiredDocumentFields: Array<keyof Document> = [
    'providerId',      // Unique identifier for the provider
    'name',            // Name of the document
    'type',            // Format of the document
    'category',    // Category of the document
    'content'          // Base64 encoded content of the document
];
/**
 * List of allowed document formats.
 * This defines the formats that documents can be in, e.g., 'pdf'.
 */
export const AllowedDocumentFormats: Array<string> = [
    'PDF', // Portable Document Format (PDF) is currently the only allowed format
];
/**
 * List of allowed document categories.
 * These are the types of documents that are permitted. They should match the predefined categories.
 */
export const AllowedDocumentCategories: Array<string> = [
    'MEDICAL_LICENSE',       // Document representing a medical license
    'BOARD_CERTIFICATION',   // Document representing a board certification
    'MALPRACTICE_INSURANCE'  // Document representing malpractice insurance
];
/**
 * Maximum allowed document size in bytes.
 * This is used to restrict the size of uploaded documents to ensure they are manageable.
 */
export const AllowedDocumentSize: number = 5 * 1024 * 1024; // 5 MB
