import { DocumentBase64 } from './helpers/types';
import * as validation from './helpers/validation';

/**
 * The validation logic for a document upload process.
 * @param event 
 * @param context 
 * @returns 
 */
 exports.handler = async (event: any) => {
  const document: DocumentBase64 = event.body;
  const errors: string[] = [];
  const isValid = validation.isValidDocumentFormat(document.documentFormat, errors)
    && validation.isValidDocumentCategory(document.documentCategory, errors)
    && validation.isValidDocumentSize(document.documentSize, errors)
    && await validation.isFileIntegrityConfirmed(document.documentContent, document.documentFormat, errors);
    return isValid ? {
      statusCode: 200,
      body: {
        message:'Document validation successful',
        document
      }
    } : {
      statusCode: 400,
      body: {
        message: 'Document validation failed',
        errors: JSON.stringify(errors)
      }
    };
};