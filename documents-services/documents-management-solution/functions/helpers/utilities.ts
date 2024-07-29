import { v4 as uuidv4 } from 'uuid';
/**
 * Generates a unique UUID value.
 * @returns {string} - A UUID string representing a unique identifier for the dynamoDB record or for S3 object.
 */
export function generateUUID(): string {
    return uuidv4();
}

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
 export const supportedFormats = (): Array<{ format: string; contentType: string; }> => [
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
export const uploadFolder = (param1: string, param2: string) => `documents/${param1}/${param2}/uploaded`;

/**
 * Finds and returns the MIME content type for a given document format.
 * 
 * @param {string} format - The document format for which to find the content type.
 * @returns {string | null} - The corresponding MIME content type, or null if the format is not supported.
 */
export const getContentTypeByFormat = (format: string): string | null => {
    const formats = supportedFormats();
    const formatObj = formats.find(f => f.format.toUpperCase() === format.toUpperCase());
    return formatObj ? formatObj.contentType : null;
};

/**
 * Returns a list of supported document categories commonly used in various business contexts.
 * NOTE: cleanup for your application
 * 
 * @returns {Array<string>} - An array of supported document categories.
 */
 export const supportedCategories = (): Array<string> => [
    // HR Categories
    'EMPLOYMENT_CONTRACT',
    'EMPLOYEE_ONBOARDING',
    'PERFORMANCE_REVIEW',
    'TRAINING_CERTIFICATE',
    'PAYROLL_RECORD',
    'RESIGNATION_LETTER',
    'TERMINATION_NOTICE',
    'NON_DISCLOSURE_AGREEMENT',
    'BENEFITS_ENROLLMENT_FORM',
    'TIME_OFF_REQUEST',

    // Healthcare Categories
    'MEDICAL_LICENSE',
    'PATIENT_RECORD',
    'INSURANCE_CLAIM',
    'PRESCRIPTION',
    'LAB_REPORT',
    'RADIOLOGY_IMAGE',
    'CONSENT_FORM',
    'TREATMENT_PLAN',
    'REFERRAL_LETTER',
    'IMMUNIZATION_RECORD',

    // Legal Categories
    'CONTRACT',
    'CASE_FILE',
    'COURT_ORDER',
    'AFFIDAVIT',
    'LEGAL_OPINION',
    'PROPERTY_DEED',
    'WILL_AND_TESTAMENT',
    'INTELLECTUAL_PROPERTY',
    'BUSINESS_LICENSE',
    'LEGAL_NOTICE',

    // Finance Categories
    'INVOICE',
    'RECEIPT',
    'TAX_RETURN',
    'FINANCIAL_STATEMENT',
    'EXPENSE_REPORT',

    // Real Estate Categories
    'LEASE_AGREEMENT',
    'PURCHASE_AGREEMENT',
    'INSPECTION_REPORT',
    'APPRAISAL_REPORT',
    'CLOSING_DOCUMENT',

    // Education Categories
    'TRANSCRIPT',
    'DIPLOMA',
    'ENROLLMENT_FORM',
    'COURSE_MATERIAL',
    'CERTIFICATE_OF_COMPLETION',

    // Identity Verification Categories
    'DRIVING_LICENSE',
    'PASSPORT',
    'AADHAAR_CARD',
    'NATIONAL_ID_CARD',
    'SOCIAL_SECURITY_CARD',
    'VOTER_ID_CARD',
    'RESIDENCE_PERMIT',
    'BIRTH_CERTIFICATE'
];