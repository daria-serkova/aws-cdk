import { Document } from './helpers/types';
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
        const document: Document = event;
        const isValid = validation.areRequiredFieldsValid(document)
          && validation.isValidDocumentFormat(document.type)
          && validation.isValidDocumentCategory(document.category)
          && validation.isValidDocumentSize(document.size)
          && validation.isValidPdf(document.content)
        return {
            isValid,
            document
        };
    } catch (error) {
        throw new Error((error as Error).message || 'Internal Server Error');
    }
};