import { Buffer } from 'buffer';
import { SupportedDocumentsCategories, SupportedDocumentsFormats, AllowedBasicDocumentSize, supportedDocumentsTypes } from './utilities';
import { PDFDocument } from 'pdf-lib';
import imageType from 'image-type';

/**
 * Validates if the document format is supported.
 *
 * This function checks if the provided document type is included in the list of allowed document formats.
 *
 * @param {string} documentType - The type of the document to be validated.
 * @returns {boolean} - Returns true if the document format is supported; otherwise, returns false.
 */
 export const isValidDocumentFormat = (documentType: string, errors: string[]): boolean => {
    if (!SupportedDocumentsFormats.includes(documentType)) {
        errors.push(`Validation failed: document format (${documentType}) is not supported`);
        return false;
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
 export const isValidDocumentCategory = (documentCategory: string, errors: string[]): boolean => {
    if (!SupportedDocumentsCategories.includes(documentCategory)) {
        errors.push(`Validation failed: document category (${documentCategory}) is not supported`);
        return false;
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
 export const isValidDocumentSize = (documentSize: number, errors: string[]): boolean => {
    if (documentSize > AllowedBasicDocumentSize) {
        errors.push(`Validation failed: document larger than ${AllowedBasicDocumentSize} bytes`);
        return false;
    }
    return true;
};
/**
 * Checks the integrity of a file from base64 content based on the provided format.
 * 
 * @param base64Content - Base64 encoded file content.
 * @param format - The format to check against (e.g., 'PDF', 'PNG', 'JPG', 'JPEG').
 * @returns True if the file is valid and matches the format, False otherwise.
 */
 export const isFileIntegrityConfirmed = async (base64Content: string, format: string, errors: string[]): Promise<boolean> => {
    const fileBuffer = Buffer.from(base64Content, 'base64');
    switch (format) {
        case 'PDF':
            return await isPdfValid(fileBuffer, errors);
        
        case 'PNG':
        case 'JPG':
        case 'JPEG':
            return await isImageValid(fileBuffer, format, errors);
        
        default:
            errors.push('Validation failed: Attempted to validate integrity of unsupported format');
            return false;
    }
}

/**
 * Checks if a file buffer is a valid PDF.
 * 
 * @param fileBuffer - Buffer containing the file content.
 * @returns True if the PDF is valid, False if it is corrupted or invalid.
 */
async function isPdfValid(fileBuffer: Buffer, errors: string[]): Promise<boolean> {
    try {
        const pdfDoc = await PDFDocument.load(fileBuffer);
        const isEmpty = pdfDoc.getPageCount() <= 0;
        if (isEmpty) {
            errors.push('Validation failed: Empty PDF file uploaded');
        }
        return isEmpty;
    } catch (error) {
        errors.push('Validation failed: PDF file is corrupted');
        return false;
    }
}

/**
 * Checks if a file buffer is a valid image in the specified format.
 * 
 * @param fileBuffer - Buffer containing the file content.
 * @param format - The expected image format (e.g., 'PNG', 'JPG', 'JPEG').
 * @returns True if the image is valid and matches the format, False otherwise.
 */
async function isImageValid(fileBuffer: Buffer, format: string, errors: string[]): Promise<boolean> {
    try {
        const imageTypeInfo = await imageType(fileBuffer);
        if (imageTypeInfo) {
            const isFormatMatch = imageTypeInfo.ext === format.toLowerCase();
            if (!isFormatMatch) {
                errors.push(`Validation failed: Uploaded image file is not a valid ${format} format`);
            }
            return isFormatMatch;
        } else {
            errors.push(`Validation failed: Uploaded image file is corrupted`);
            return false;
        }
    } catch (error) {
        console.error('Error while checking image file', error);
        errors.push('Validation failed: Uploaded image file is corrupted');
        return false;
    }
}
