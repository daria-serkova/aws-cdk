import { DocumentBase64 } from './helpers/types';
import * as validation from './helpers/validation';

/**
 * The validation logic for a document upload process. Involves several checks to ensure 
 * the document meets specific criteria before proceeding with the upload:
 *      File Type: Verify that the document is of an acceptable file type (e.g., PDF, DOCX).
 *      File Category: Verify that the document is of an acceptable file category (e.g., MEDICAL_LICENSE).
 *      File Size: Ensure the document does not exceed a maximum file size limit.
 *      File Integrity: Check if the document is not corrupted or malformed.
 *      Metadata Validation: Validate that required metadata fields are present and correctly formatted.
 *      Virus Scan: Optionally, perform a virus scan on the document to ensure it is safe.
 * @param event 
 * @param context 
 * @returns 
 */
export const handler = async (event: any): Promise<any> => {
    try {
        const document: DocumentBase64 = event;
        
        // Perform validation checks
        const isValid = validation.isValidDocumentFormat(document.documentFormat)
            && validation.isValidDocumentCategory(document.documentCategory)
            && validation.isValidDocumentSize(document.documentSize)
            && validation.isFileIntegrityConfirmed(document.documentContent, document.documentFormat);

          console.log(validation.isFileIntegrityConfirmed(document.documentContent, document.documentFormat))
        if (isValid) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    message: 'Document is valid.',
                    document
                })
            };
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    success: false,
                    message: 'Document validation failed.',
                    errors: [
                        // Add specific validation error messages if available
                        'Invalid document format.',
                        'Document size exceeds limit.'
                    ]
                })
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                message: (error as Error).message || 'Internal Server Error'
            })
        };
    }
};
