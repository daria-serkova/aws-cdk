import { Buffer } from 'buffer';
import { Document } from './types';
import { AllowedDocumentCategories, AllowedDocumentFormats, AllowedDocumentSize, RequiredDocumentFields } from './configs';

/**
 * Validates if the document format is supported.
 *
 * This function checks if the provided document type is included in the list of allowed document formats.
 *
 * @param {string} documentType - The type of the document to be validated.
 * @returns {boolean} - Returns true if the document format is supported; otherwise, returns false.
 */
 export const isValidDocumentFormat = (documentType: string): boolean => {
    if (!AllowedDocumentFormats.includes(documentType.toUpperCase())) {
        throw new Error(`Validation failed: document format (${documentType}) is not supported`);
    }
    return true;
};
/**
 * Validates if the document category is supported.
 *
 * This function checks if the provided document category is included in the list of allowed document categories.
 *
 * @param {string} documentCategory - The category of the document to be validated.
 * @returns {boolean} - Returns true if the document category is supported; otherwise, returns false.
 */
 export const isValidDocumentCategory = (documentCategory: string): boolean => {
    if (!AllowedDocumentCategories.includes(documentCategory.toUpperCase())) {
        throw new Error(`Validation failed: document category (${documentCategory}) is not supported`);
    }
    return true;
};
/**
 * Validates if the document size is within the allowed limit.
 *
 * This function checks if the provided document size is less than or equal to the maximum allowed document size.
 *
 * @param {number} documentSize - The size of the document to be validated in bytes.
 * @returns {boolean} - Returns true if the document size is within the allowed limit; otherwise, returns false.
 */
 export const isValidDocumentSize = (documentSize: number): boolean => {
    if (documentSize > AllowedDocumentSize) {
        throw new Error(`Validation failed: document larger than ${AllowedDocumentSize} bytes`);
    }
    return true;
};
/**
 * Checks if the provided Base64 encoded content represents a valid PDF file.
 *
 * This function performs the following validations:
 * 1. Ensures that the content is provided.
 * 2. Checks if the binary content starts with the PDF header ("%PDF-") and ends with the PDF footer ("%%EOF").
 * @param {string} base64Content - The Base64 encoded content of the PDF file.
 * @returns {boolean} - Returns true if the content is a valid PDF file; otherwise, returns false.
 */
 export const isValidPdf = (base64Content: string): boolean => {
    if (!base64Content) {
        throw new Error(`Validation failed: content is not provided`);
    }
    // Decode Base64 content
    const binaryContent = Buffer.from(base64Content, 'base64');
    // Perform basic PDF structure check
    const pdfHeader = '%PDF-';
    const pdfFooter = '%%EOF';
    const startValid = binaryContent.slice(0, pdfHeader.length).toString('ascii') === pdfHeader;
    const endValid = binaryContent.slice(-pdfFooter.length).toString('ascii') === pdfFooter;
    if (!startValid || !endValid) {
        throw new Error(`Validation failed: invalid PDF structure`);
    }
    return true;
};
/**
 * Validates if all required document fields are present and non-empty.
 *
 * @param {Document} document - The document to be validated.
 * @returns {boolean} - Returns true if all required fields are present and non-empty; otherwise, returns false.
 */
export const areRequiredFieldsValid = (document: Document): boolean => {
    for (const field of RequiredDocumentFields) {
        const value = document[field as keyof Document];
        if (!value || value.toString().trim() === '') {
            throw new Error(`Validation failed: required field is missing (${field})`);
        }
    }
    return true;
};