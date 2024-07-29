/**
 * Represents a healthcare provider document for verification and management.
 *
 * This interface defines the structure of a document object used in the document management system. 
 * It includes essential details about the document and the provider, ensuring proper validation, 
 * categorization, and processing within the system.
 *
 * @interface Document
 * @property {string} providerId - A unique identifier for the healthcare provider who owns or submitted the document.
 * @property {string} name - The name of the document file (e.g., "medical-license.pdf").
 * @property {string} type - The file type or format of the document (e.g., "pdf").
 * @property {string} category - The specific category of document being uploaded (e.g., "medical-license").
 * @property {string} content - The Base64 encoded content of the document.
 * @property {string} uploadedAt - The timestamp when the document was uploaded, in ISO 8601 format.
 * @property {Object} metadata - Additional metadata related to the document.
 * @property {string} metadata.documentNumber - The license number provided in the document, if applicable.
 * @property {string} metadata.issueDate - The date when the document or license was issued.
 * @property {string} metadata.expiryDate - The date when the document or license expires.
 * @property {string} metadata.issuedBy - The authority or organization that issued the document.
 */
 export interface UploadedDocument {
    providerId: string;
    providerEmail: string;
    providerName: string;
    name: string;
    type: string;
    category: string;
    size: number;
    content: string;
    uploadedAt: string;
    metadata: {
        documentNumber: string,
        issueDate: string,
        expiryDate: string,
        issuedBy: string
    }
}
export interface DocumentMetadata {
    id: string;
    providerId: string;
    type: string;
    url: string;
    documentNumber: string;
    issueDate: string;
    expiryDate: string;
    issuedBy: string;
    verificationStatus: string;
    uploadTimestamp: string;
};
export interface AuditEvent {
    id: string;
    eventType: string;
    timestamp: string;
    actor: {
      userId: string;
      userType: string;
    },
    sourceIP: string;
    device: {
      deviceType: string;
      deviceModel: string;
      deviceVendor: string;
      osName: string;
      osVersion: string;
      browserName: string;
      browserVersion: string;
    };
  };
  export interface AuditEventDocumentUpload extends AuditEvent {
    actionDetails: {
        id: string,
        providerId: string,
        type: string,
        url: string,
        documentNumber: string,
        issueDate: string,
        expiryDate: string,
        issuedBy: string,
        verificationStatus: string,
        uploadTimestamp: string
    }
  };




