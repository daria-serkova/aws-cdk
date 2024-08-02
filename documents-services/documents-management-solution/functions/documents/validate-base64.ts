import * as validation from '../helpers/validation';

/**
 * The validation logic for a document upload process.
 * @param event 
 * @param context 
 * @returns 
 */
export const handler = async (event: any): Promise<any> => {
  const { documentFormat, documentCategory, documentSize, documentContent} =  event.body;
  if (!documentFormat || !documentCategory || !documentSize || !documentContent) {
    return {
      statusCode: 400,
      body: {
        error: `Can't validate document. Required data elements are missing`
      }
    }
  }
  const errors: string[] = [];
  const isValid = validation.isValidDocumentFormat(documentFormat, errors)
      && validation.isValidDocumentCategory(documentCategory, errors)
      && validation.isValidDocumentSize(documentSize, errors)
      && await validation.isFileIntegrityConfirmed(documentContent, documentFormat, errors);
  return isValid 
  ? {
      statusCode: 200,
      body: {
        ...event.body,
      }
    } 
  : {
      statusCode: 400,
      body: {
        message: 'Document validation failed',
        errors: JSON.stringify(errors)
      }
    };
};