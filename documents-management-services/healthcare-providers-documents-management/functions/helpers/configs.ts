import { UploadedDocument } from './types';
/**
 * List of required fields for a Document type.
 * These fields must be present and non-empty in a valid Document.
 */
export const RequiredDocumentFields: Array<keyof UploadedDocument> = [
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

export const DocumentsStoragePaths = {
    CREDENTIALS: {
        SUBMITTED: 'providers/$/credentials/submitted',
        VERIFIED: 'providers/$/credentials/verified',
        REJECTED: 'providers/$/credentials/rejected',
    }
}
export const DocumentsStatuses = {
    VERIFICATION: {
        PENDING: 'VERIFICATION_PENDING',
        VERIFIED: 'VERIFIED',
        REJECTED: 'REJECTED',
    }
}
export const documentContentType = (format: string) => {
    switch (format) {
        case 'pdf': case 'PDF':
            return 'application/pdf'
    }
    return '';
}

export const AuditEventTypes = {
    DOCUMENT_UPLOAD: 'DOCUMENT_UPLOAD'
}

export const UserTypes = {
    HEALTHCARE_PROVIDER: 'HealthcareProvider'
}

export const EmailTypes = {
    DOCUMENT_UPLOADED: 'DOCUMENT_UPLOADED'
}
export const EmailAttachments = [
    {
      filename: "logo.png",
      path: `${process.env.EMAILS_MEDIA_PATH}/logo.png`,
      cid: "logoImage", //same cid value as in the html img src
    },
    {
      filename: "x.png",
      path: `${process.env.EMAILS_MEDIA_PATH}/x.png`,
      cid: "xIcon", //same cid value as in the html img src
    },
    {
      filename: "youtube.png",
      path: `${process.env.EMAILS_MEDIA_PATH}/youtube.png`,
      cid: "youtubeIcon", //same cid value as in the html img src
    },
    {
      filename: "linkedinIcon.png",
      path: `${process.env.EMAILS_MEDIA_PATH}/linkdin.png`,
      cid: "linkedinIcon", //same cid value as in the html img src
    },
    {
      filename: "instagram.png",
      path: `${process.env.EMAILS_MEDIA_PATH}/instagram.png`,
      cid: "instagramIcon", //same cid value as in the html img src
    },
  ]
