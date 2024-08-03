import { v4 as uuidv4 } from 'uuid';
/**
 * Generates a unique UUID value.
 * @returns {string} - A UUID string representing a unique identifier for the dynamoDB record or for S3 object.
 */
export function generateUUID(): string {
    return uuidv4();
}
/**
 * Path inside S3 bucket where all new documents should be uploaded
 */
export const uploadFolder = (param1: string, param2: string) => `documents/${param1}/${param2}/uploaded`;

/**
 * Returns a list of supported document formats along with their corresponding MIME content types.
 * 
 * This function provides an array of objects, each representing a document format
 * commonly used in HR, Healthcare, and Legal applications. The formats include both 
 * text-based documents and various image formats to ensure compatibility with a wide range of 
 * document types. This is crucial for handling diverse workflows and maintaining the integrity 
 * of document contents in different real-world scenarios.
 * 
 * Supported Formats:
 * - PDF: Portable Document Format, widely used for maintaining document formatting across different platforms.
 * - DOC/DOCX: Microsoft Word Document formats, commonly used for editable text documents.
 * - XLS/XLSX: Microsoft Excel Spreadsheet formats, used for data analysis and financial records.
 * - CSV: Comma-Separated Values, a simple text format for tabular data.
 * - TXT: Plain Text, used for basic text documents without formatting.
 * - RTF: Rich Text Format, supporting basic text formatting and compatibility with many word processors.
 * - JPG/JPEG: Joint Photographic Experts Group format, a compressed image format used for photos and scanned documents.
 * - PNG: Portable Network Graphics, a lossless image format used for graphics and images with transparency.
 * - TIFF/TIF: Tagged Image File Format, a high-quality image format used for scanned documents and medical images.
 * - GIF: Graphics Interchange Format, used for simple graphics and animations.
 * - BMP: Bitmap, an uncompressed image format used for high-quality images.
 * - XML: Extensible Markup Language, used for structured data and data exchange between systems.
 * - DICOM: Digital Imaging and Communications in Medicine, a format used for medical imaging files.
 * 
 * @returns {Array<{format: string, contentType: string}>} - An array of objects, each containing a document format and its MIME content type.
 */
 export const supportedDocumentsTypes = (): Array<{ format: string; contentType: string; }> => [
    { format: 'PDF', contentType: 'application/pdf' },
    { format: 'DOC', contentType: 'application/msword' },
    { format: 'DOCX', contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { format: 'XLS', contentType: 'application/vnd.ms-excel' },
    { format: 'XLSX', contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
    { format: 'CSV', contentType: 'text/csv' },
    { format: 'TXT', contentType: 'text/plain' },
    { format: 'RTF', contentType: 'application/rtf' },
    { format: 'JPG', contentType: 'image/jpeg' },
    { format: 'JPEG', contentType: 'image/jpeg' },
    { format: 'PNG', contentType: 'image/png' },
    { format: 'TIFF', contentType: 'image/tiff' },
    { format: 'TIF', contentType: 'image/tiff' },
    { format: 'GIF', contentType: 'image/gif' },
    { format: 'BMP', contentType: 'image/bmp' },
    { format: 'XML', contentType: 'application/xml' },
    { format: 'DICOM', contentType: 'application/dicom' }
];

/**
 * Finds and returns the MIME content type for a given document format.
 * 
 * @param {string} format - The document format for which to find the content type.
 * @returns {string | null} - The corresponding MIME content type, or null if the format is not supported.
 */
export const getContentTypeByFormat = (format: string): string | null => {
    const documentsTypes = supportedDocumentsTypes();
    const formatObj = documentsTypes.find(f => f.format.toUpperCase() === format.toUpperCase());
    return formatObj ? formatObj.contentType : null;
};

/**
 * Returns a list of supported document categories commonly used in various business contexts.
 * NOTE: cleanup for your application
 * 
 * @returns {Array<string>} - An array of supported document categories.
 */
 export const supportedDocumentsCategories = (): Array<{ category: string; reviewRequired: boolean; }> => [
    // HR Categories
    { category: 'EMPLOYMENT_CONTRACT', reviewRequired: false },
    { category: 'EMPLOYEE_ONBOARDING', reviewRequired: false },
    { category: 'PERFORMANCE_REVIEW', reviewRequired: false },
    { category: 'TRAINING_CERTIFICATE', reviewRequired: false },
    { category: 'PAYROLL_RECORD', reviewRequired: false },
    { category: 'RESIGNATION_LETTER', reviewRequired: false },
    { category: 'TERMINATION_NOTICE', reviewRequired: false },
    { category: 'NON_DISCLOSURE_AGREEMENT', reviewRequired: false },
    { category: 'BENEFITS_ENROLLMENT_FORM', reviewRequired: false },
    { category: 'TIME_OFF_REQUEST', reviewRequired: false },

    // Healthcare Categories
    { category: 'MEDICAL_LICENSE', reviewRequired: true },
    { category: 'PATIENT_RECORD', reviewRequired: true },
    { category: 'INSURANCE_CLAIM', reviewRequired: true },
    { category: 'PRESCRIPTION', reviewRequired: true },
    { category: 'LAB_REPORT', reviewRequired: true },
    { category: 'RADIOLOGY_IMAGE', reviewRequired: true },
    { category: 'CONSENT_FORM', reviewRequired: true },
    { category: 'TREATMENT_PLAN', reviewRequired: true },
    { category: 'REFERRAL_LETTER', reviewRequired: true },
    { category: 'IMMUNIZATION_RECORD', reviewRequired: true },

    // Legal Categories
    { category: 'CONTRACT', reviewRequired: true },
    { category: 'CASE_FILE', reviewRequired: true },
    { category: 'COURT_ORDER', reviewRequired: true },
    { category: 'AFFIDAVIT', reviewRequired: true },
    { category: 'LEGAL_OPINION', reviewRequired: true },
    { category: 'PROPERTY_DEED', reviewRequired: true },
    { category: 'WILL_AND_TESTAMENT', reviewRequired: true },
    { category: 'INTELLECTUAL_PROPERTY', reviewRequired: true },
    { category: 'BUSINESS_LICENSE', reviewRequired: true },
    { category: 'LEGAL_NOTICE', reviewRequired: true },

    // Finance Categories
    { category: 'INVOICE', reviewRequired: false },
    { category: 'RECEIPT', reviewRequired: false },
    { category: 'TAX_RETURN', reviewRequired: false },
    { category: 'FINANCIAL_STATEMENT', reviewRequired: false },
    { category: 'EXPENSE_REPORT', reviewRequired: false },

    // Real Estate Categories
    { category: 'LEASE_AGREEMENT', reviewRequired: false },
    { category: 'PURCHASE_AGREEMENT', reviewRequired: false },
    { category: 'INSPECTION_REPORT', reviewRequired: false },
    { category: 'APPRAISAL_REPORT', reviewRequired: false },
    { category: 'CLOSING_DOCUMENT', reviewRequired: false },

    // Education Categories
    { category: 'TRANSCRIPT', reviewRequired: false },
    { category: 'DIPLOMA', reviewRequired: false },
    { category: 'ENROLLMENT_FORM', reviewRequired: false },
    { category: 'COURSE_MATERIAL', reviewRequired: false },
    { category: 'CERTIFICATE_OF_COMPLETION', reviewRequired: false },

    // Identity Verification Categories
    { category: 'DRIVING_LICENSE', reviewRequired: false },
    { category: 'PASSPORT', reviewRequired: false },
    { category: 'AADHAAR_CARD', reviewRequired: false },
    { category: 'NATIONAL_ID_CARD', reviewRequired: false },
    { category: 'SOCIAL_SECURITY_CARD', reviewRequired: false },
    { category: 'VOTER_ID_CARD', reviewRequired: false },
    { category: 'RESIDENCE_PERMIT', reviewRequired: false },
    { category: 'BIRTH_CERTIFICATE', reviewRequired: false }
];

export const SupportedDocumentsCategories: string[] = supportedDocumentsCategories().map(f => f.category);
export const SupportedDocumentsFormats: string[] = supportedDocumentsTypes().map(f => f.format);
export const AllowedBasicDocumentSize: number = 5 * 1024 * 1024; // 5 MB
export const SupportedInitiatorSystemCodes: string[] = [
    "DHS_PP_WEB_APP",
    "DHS_PP_MBL_APP",
]

export const DocumentStatuses = {
    UPLOADED: "Uploaded",                       // The document has been successfully uploaded to the system but has not yet been processed.
    PENDING_REVIEW: "Pending Review",           // The document is awaiting review by an administrator or an automated system.
    UNDER_REVIEW: "Under Review",               // The document is currently being reviewed for accuracy and validity.
    VERIFIED: "Verified",                       // The document has been reviewed and verified as authentic and accurate.
    REJECTED: "Rejected",                       // The document has been reviewed and found to be invalid, incomplete, or fraudulent.
    
    // TBD Cleanup below
    
    EXPIRED: "Expired",                         // The document has passed its expiry date and is no longer considered valid.
    RENEWAL_REQUIRED: "Renewal Required",       // The document is nearing its expiry date and needs to be renewed.
    IN_PROGRESS: "In Progress",                 // The document is in the process of being uploaded or processed.
    FAILED_UPLOAD: "Failed Upload",             // The document upload failed due to some error.
    AWAITING_METADATA: "Awaiting Metadata",     // The document has been uploaded but is missing required metadata.
    ARCHIVED: "Archived",                       // The document has been archived and is no longer actively used.
    DELETED: "Deleted",                         // The document has been deleted from the system.
    FLAGGED: "Flagged",                         // The document has been flagged for further investigation or special attention.
    PROCESSING: "Processing",                   // The document is currently being processed by the system (e.g., virus scan, format conversion).
    PENDING_APPROVAL: "Pending Approval",       // The document has been reviewed and is awaiting final approval from a higher authority.
    APPROVED: "Approved",                       // The document has been approved after review.
    SUBMITTED: "Submitted",                     // The document has been submitted for review or processing but has not yet been addressed.
    SUPERSEDED: "Superseded",                   // The document has been replaced by a newer version.
    QUARANTINED: "Quarantined"                  // The document has been identified as potentially harmful and is isolated for further examination.
}

/**
 * Determines the document status based on the category.
 *
 * @param {string} category - The category of the document.
 * @returns {string} - The status of the document ("Uploaded" or "Pending Review").
 */
 export const determineDocumentStatus = (category: string): string => {
    const categoryObj = supportedDocumentsCategories().find(cat => cat.category === category);
    return categoryObj && categoryObj.reviewRequired ? DocumentStatuses.PENDING_REVIEW : DocumentStatuses.UPLOADED;
};
export const PreSignUrlsExpirationConfigs = {
    DOCUMENT_VIEW_EXPIRATION_DURATION: 3600
}
  
export const getAuditEvent = (
        documentId: string,
        version: string,
        documentOwner: string,
        event: string, 
        eventTime: string, 
        eventInitiator: string, 
        initiatorSystemCode: string) => {
    return  {
        auditId: generateUUID(),
        documentId,
        version,
        documentOwner,
        event,
        eventTime,
        eventInitiator,
        initiatorSystemCode
      }
}

export const getCurrentTime = () => new Date().getTime().toString();


