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
 export const isValidDocumentFormat = (documentType: string): boolean => {
    if (!SupportedDocumentsFormats.includes(documentType)) {
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
    if (!SupportedDocumentsCategories.includes(documentCategory)) {
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
    if (documentSize > AllowedBasicDocumentSize) {
        throw new Error(`Validation failed: document larger than ${AllowedBasicDocumentSize} bytes`);
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
 export const isFileIntegrityConfirmed = async (base64Content: string, format: string): Promise<boolean> => {
    const fileBuffer = Buffer.from(base64Content, 'base64');
    switch (format) {
        case 'PDF':
            return isPdfValid(fileBuffer);
        case 'PNG':
        case 'JPG':
        case 'JPEG':
            return isImageValid(fileBuffer, format);
        default:
            console.error('Unsupported format');
            return false;
    }
}

/**
 * Checks if a file buffer is a valid PDF.
 * 
 * @param fileBuffer - Buffer containing the file content.
 * @returns True if the PDF is valid, False if it is corrupted or invalid.
 */
async function isPdfValid(fileBuffer: Buffer): Promise<boolean> {
    try {
        const pdfDoc = await PDFDocument.load(fileBuffer);
        return pdfDoc.getPageCount() > 0;
    } catch (error) {
        console.error('Error while loading PDF file', error);
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
async function isImageValid(fileBuffer: Buffer, format: string): Promise<boolean> {
    try {
        const imageTypeInfo = await imageType(fileBuffer);
        if (imageTypeInfo) {
            return imageTypeInfo.ext === format.toLowerCase();
        } else {
            console.error(`Uploaded file is not a valid ${format} format`);
            return false;
        }
    } catch (error) {
        console.error('Error while checking image file', error);
        return false;
 
    }
}