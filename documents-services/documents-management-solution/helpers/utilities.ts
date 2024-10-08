import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';
import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { ResourceName } from '../lib/resource-reference';
config();

/**
 * Identifies envrironment of the deployment to minimize AWS cost for non-production environments.
 */
export const isProduction = process.env.TAG_ENVIRONMENT === 'production';
/**
* Creates a LambdaInvoke task.
* @param scope 
* @param id 
* @param lambdaFunction 
* @param additionalProps 
*/
export const createLambdaInvokeTask = (scope: Construct, id: string, lambdaFunction: () => any, additionalProps = {}): LambdaInvoke => (
 new LambdaInvoke(scope, id, {
   lambdaFunction: lambdaFunction(),
   outputPath: '$.Payload',
   ...additionalProps
 })
);
/**
 * Generates a unique UUID value.
 * @returns {string} - A UUID string representing a unique identifier for the business entity.
 */
export const generateUUID = (): string => uuidv4();
/**
 * Generates a unique UUID value with length of 8 characters.
 * @returns {string} - A UUID string representing a unique identifier for name's suffix.
 */
 export const generateUUIDNameSuffix = (): string => {
    const uuid = uuidv4().replace(/-/g, '');
    return uuid.substring(0, 6);
};
/**
 * Path inside S3 bucket where all new documents should be uploaded
 */
export const uploadFolder = (documentType: string, uuid: string) => {
    return `${getDocumentS3Folder(documentType)}`.replace('$status', 'uploaded').replace('$id', uuid);
}
export const verifiedFolder = (documentType: string, uuid: string) => {
    return `${getDocumentS3Folder(documentType)}`.replace('$status', 'verified').replace('$id', uuid);
}
export const rejectedFolder = (documentType: string, uuid: string) => {
    return `${getDocumentS3Folder(documentType)}`.replace('$status', 'rejected').replace('$id', uuid);
}
export const DocumentStatusFolderNames = {
    UPLOADED: 'uploaded',
    REJECTED: 'rejected',
    VERIFIED: 'verified',
    EXPIRED: 'expired',
}
export const SupportedUploadFolders = [
    'providers/uploaded/',
    'insurance/uploaded/',
    'billing/uploaded/',
    'consent-forms/uploaded/',
    'patients/uploaded/',
]
export const SupportedVerifiedFolders = [
    'providers/verified/',
    'insurance/verified/',
    'billing/verified/',
    'consent-forms/verified/',
    'patients/verified/',
];
export const SupportedRejectedFolders = [
    'providers/rejected/',
    'insurance/rejected/',
    'billing/rejected/',
    'consent-forms/rejected/',
    'patients/rejected/',
]
/**
 * Returns a list of supported document categories.
 * NOTE: cleanup for your application
 * 
 * @returns {Array<string>} - An array of supported document categories.
 */
 export const supportedDocumentsCategories = (): Array<{ 
        category: string;
        reviewRequired: boolean;
        folder: string
    }> => {
        const providersPersonalFolder = 'providers/$status/$id/personal';
        const providersEducationFolder = 'providers/$status/$id/education';
        const providersMedicalFolder = 'providers/$status/$id/medical';
        const providersBusinessFolder = 'providers/$status/$id/business'
        const insuranceDocumentsFolder = 'insurance/$status/$id';
        const billingDocumentsFolder = 'billing/$status/$id';
        const consentFormsDocumentsFolder = 'consent-forms/$status/$id';
        const patientsDocumentsFolder = 'patients/$status/$id';

    return [
    // Providers Documents
    { 
        category: 'PROFESSIONAL_PHOTO', reviewRequired: true, 
        folder: providersPersonalFolder 
    },
    { 
        category: 'AADHAAR_CARD', reviewRequired: true, 
        folder: providersPersonalFolder
    },
    { 
        category: 'PAN_CARD', reviewRequired: true, 
        folder: providersPersonalFolder 
    },
    { 
        category: 'BACHELOR_DEGREE', reviewRequired: true, 
        folder: providersEducationFolder
    },
    { 
        category: 'MASTER_DEGREE', reviewRequired: true,
        folder: providersEducationFolder 
    },
    { 
        category: 'PHD_DEGREE', reviewRequired: true,
        folder: providersEducationFolder
    },
    { 
        category: 'MEDICAL_REGISTRATION_CERTIFICATE', reviewRequired: true,
        folder: providersMedicalFolder
    },
    { 
        category: 'BUSINESS_REGISTRATION_CERTIFICATE', reviewRequired: true,
        folder: providersBusinessFolder 
    },
    { 
        category: 'BUSINESS_INSURANCE_CERTIFICATE', reviewRequired: true,
        folder: providersBusinessFolder 
    },
    { 
        category: 'BUSINESS_GST_IN', reviewRequired: true,
        folder: providersBusinessFolder 
    },
    { 
        category: 'BUSINESS_PHOTO', reviewRequired: true,
        folder: providersBusinessFolder
    },
    { 
        category: 'BUSINESS_ADDITIONAL_PROOF_OF_ADDRESS', reviewRequired: true,
        folder: providersBusinessFolder
    },

    // Insurance documents
    { 
        category: 'INSURANCE_CLAIM', reviewRequired: true,
        folder: `${insuranceDocumentsFolder}/claims`
    },
    { 
        category: 'PRE-AUTH-REQUEST', reviewRequired: true,
        folder: `${insuranceDocumentsFolder}/pre-auth-requests`
    },
    
    // Billing Documents
    { 
        category: 'BILLING_STATEMENT', reviewRequired: true,
        folder: `${billingDocumentsFolder}/statements` 
    },
    { 
        category: 'PAYMENT_RECEIPT', reviewRequired: true,
        folder: `${billingDocumentsFolder}/payment-receipts`
    },
    
    // Consent Forms
    { 
        category: 'INFORMED_CONSENT_FOR_PROCEDURE', reviewRequired: true,
        folder: `${consentFormsDocumentsFolder}/procedures`
    },
    { 
        category: 'CONSENT_FOR_MEDICAL_INFO_RELEASE', reviewRequired: true,
        folder: `${consentFormsDocumentsFolder}/medical-info-release`
    },
    { 
        category: 'CONSENT_FOR_RESEARCH_PARTICIPATION', reviewRequired: true,
        folder: `${consentFormsDocumentsFolder}/research-participation` 
    },

    // Patient Documents
    { 
        category: 'PRESCRIPTION', reviewRequired: true,
        folder: `${patientsDocumentsFolder}/perscriptions`
    },
    { 
        category: 'LAB_REPORT', reviewRequired: true,
        folder: `${patientsDocumentsFolder}/lab-reports`
    },
    { 
        category: 'RADIOLOGY_IMAGE', reviewRequired: true,
        folder: `${patientsDocumentsFolder}/radiology-images`
    },
    { 
        category: 'TREATMENT_PLAN', reviewRequired: true,
        folder: `${patientsDocumentsFolder}/treatment-plans`
    },
    { 
        category: 'REFERRAL_LETTER', reviewRequired: true,
        folder: `${patientsDocumentsFolder}/referral-letters` 
    },
    { 
        category: 'IMMUNIZATION_RECORD', reviewRequired: true,
        folder: `${patientsDocumentsFolder}/immunization-records`
    },
]}
export const RequestOperations = {
    DOCUMENT: 'DOCUMENT',
    USER: 'USER'
}
export const SupportedRequestOperations: string[]  = Object.values(RequestOperations);
/**
 * Returns a list of supported document categories.
 * NOTE: cleanup for your application
 * 
 * @returns {Array<string>} - An array of supported document categories.
 */
 export const supportedDocumentsTypes = (): Array<{ 
    type: string;
    tablePattern: string;
}> => [
    { 
        type: 'providers', 
        tablePattern: ResourceName.dynamoDbTables.DOCUMENT_TYPES_TABLES.PROVIDERS, 
    },
    { 
        type: 'insurance', 
        tablePattern: ResourceName.dynamoDbTables.DOCUMENT_TYPES_TABLES.INSURANCE, 
    },
    { 
        type: 'billing', 
        tablePattern: ResourceName.dynamoDbTables.DOCUMENT_TYPES_TABLES.BILLING, 
    },
    { 
        type: 'patients', 
        tablePattern: ResourceName.dynamoDbTables.DOCUMENT_TYPES_TABLES.PATIENTS,  
    },
    { 
        type: 'consent-forms', 
        tablePattern: ResourceName.dynamoDbTables.DOCUMENT_TYPES_TABLES.CONSENT_FORMS,  
    },
];
export const SupportedDocumentTypes: string[] = supportedDocumentsTypes().map(f => f.type);
export const SupportedDocumentS3Directories: string[] = supportedDocumentsCategories().map(f => f.folder);
export const SupportedDocumentsCategories: string[] = supportedDocumentsCategories().map(f => f.category);
export const SupportedParamsPatterns = {
    IP: "^((25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$"
}

export const getDocumentTableNamePatternByType = (type: string): string | undefined => {
    const entries = supportedDocumentsTypes();
    const entry = entries.find(result => result.type.toUpperCase() === type.toUpperCase());
    return entry ? entry.tablePattern : undefined;
};
export const getDocumentS3Folder = (category: string): string | undefined => {
    const entries = supportedDocumentsCategories();
    const entry = entries.find(result => result.category.toUpperCase() === category.toUpperCase());
    return entry ? entry.folder : undefined;
};


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
export const supportedDocumentsFormatsConentTypeMapping = (): Array<{ format: string; contentType: string; }> => [
    { format: 'PDF', contentType: 'application/pdf' },
    { format: 'JPG', contentType: 'image/jpeg' },
    { format: 'JPEG', contentType: 'image/jpeg' },
    { format: 'PNG', contentType: 'image/png' },
    
    /* Uncomment lines below if application should support other formats
    { format: 'DOC', contentType: 'application/msword' },
    { format: 'DOCX', contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { format: 'XLS', contentType: 'application/vnd.ms-excel' },
    { format: 'XLSX', contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
    { format: 'CSV', contentType: 'text/csv' },
    { format: 'TXT', contentType: 'text/plain' },
    { format: 'RTF', contentType: 'application/rtf' },
    { format: 'TIFF', contentType: 'image/tiff' },
    { format: 'TIF', contentType: 'image/tiff' },
    { format: 'GIF', contentType: 'image/gif' },
    { format: 'BMP', contentType: 'image/bmp' },
    { format: 'XML', contentType: 'application/xml' },
    { format: 'DICOM', contentType: 'application/dicom' }
    */
];
export const SupportedDocumentsFormats: string[] = supportedDocumentsFormatsConentTypeMapping().map(f => f.format);

/**
 * Finds and returns the MIME content type for a given document format.
 * 
 * @param {string} format - The document format for which to find the content type.
 * @returns {string | null} - The corresponding MIME content type, or null if the format is not supported.
 */
 export const getContentTypeByFormat = (format: string): string | undefined => {
    const supportedTypes = supportedDocumentsFormatsConentTypeMapping();
    const documentType = supportedTypes.find(docType => docType.format.toUpperCase() === format.toUpperCase());
    return documentType ? documentType.contentType : undefined;
};
export const AllowedDocumentSize: number = 5 * 1024 * 1024; // 5 MB
export const SupportedInitiatorSystemCodes: string[] = [
    "ABC_WEB_APP",
    "ABC_MBL_APP",
]
export const DocumentStatuses = {
    UPLOADED: "Uploaded",                       // The document has been successfully uploaded to the system but has not yet been processed.
    PENDING_REVIEW: "Pending Review",           // The document is awaiting review by an administrator or an automated system.
    UNDER_REVIEW: "Under Review",               // The document is currently being reviewed for accuracy and validity.
    VERIFIED: "Verified",                       // The document has been reviewed and verified as authentic and accurate.
    REJECTED: "Rejected",                       // The document has been reviewed and found to be invalid, incomplete, or fraudulent.
    EXPIRED: "Expired",                         // The document has passed its expiry date and is no longer considered valid.
    RENEWAL_REQUIRED: "Renewal Required",       // The document is nearing its expiry date and needs to be renewed.
    
    /*
    QUARANTINED: "Quarantined"                  // The document has been identified as potentially harmful and is isolated for further examination.
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
    */
}
export const SupportedDocumentStatuses = Object.values(DocumentStatuses);

export const EventCodes = {
    VIEW_CONTENT: "View Content",            // When a document is viewed.
    VIEW_METADATA: "View Metadata",            // When a document is viewed.
    UPLOAD: "Upload",                         // When a document is uploaded.
    STARTED_VERIFICATION: "Started Verification",    // When a document is submitted for review.
    VERIFIED: "Verified",                       // When a document is verified.
    REJECTED: "Rejected",                       // When a document is rejected.
    
    /*

    PRINT: "Print",                           // When a document is printed.
    IMPORT: "Import",                         // When a document is imported from another system.
    EXPORT: "Export",                         // When a document is exported to another system.
    DOWNLOAD: "Download",                     // When a document is downloaded.
    METADATA_UPDATE: "Metadata Update",       // When a document's metadata is updated.
    DELETE: "Delete",                         // When a document is deleted. 
    
    // Not supported in next app
    RENAME: "Rename",                         // When a document is renamed.
    MOVE: "Move",                             // When a document is moved to a different location.
    SHARE: "Share",                           // When a document is shared with another user.
    PERMISSION_CHANGE: "Permission Change",   // When a document's permissions are changed.
    LOCK: "Lock",                             // When a document is locked.
    UNLOCK: "Unlock",                         // When a document is unlocked.
    ARCHIVE: "Archive",                       // When a document is archived.
    RESTORE: "Restore",                       // When a document is restored from archive.
    TAG: "Tag",                               // When a document is tagged.
    UNTAG: "Untag",                           // When a tag is removed from a document.
    ACCESS_REQUEST: "Access Request",         // When a request for document access is made.
    ACCESS_APPROVE: "Access Approve",         // When a request for document access is approved.
    ACCESS_DENY: "Access Deny",               // When a request for document access is denied.
    SIGN: "Sign",                             // When a document is signed.
    UNSIGN: "Unsign",                         // When a signature is removed from a document.
    COMMENT: "Comment",                       // When a comment is added to a document.
    COMMENT_UPDATE: "Comment Update",         // When a comment on a document is updated.
    COMMENT_DELETE: "Comment Delete",         // When a comment on a document is deleted.
    CHECKOUT: "Checkout",                     // When a document is checked out for editing.
    CHECKIN: "Checkin",                       // When a document is checked in after editing.
    REVIEW_COMPLETE: "Review Complete",       // When a document review is completed.
    RETENTION_SET: "Retention Set",           // When a retention policy is set for a document.
    RETENTION_REMOVE: "Retention Remove",     // When a retention policy is removed from a document.
    EXPIRATION_SET: "Expiration Set",         // When an expiration date is set for a document.
    EXPIRATION_REMOVE: "Expiration Remove",   // When an expiration date is removed from a document.
   
    ANNOTATE: "Annotate",                     // When a document is annotated.
    ANNOTATION_REMOVE: "Annotation Remove"    // When an annotation is removed from a document.
    */
};
export const SupportedEventCodes: string[] = Object.values(EventCodes);

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
    DOCUMENT_VIEW_EXPIRATION_DURATION: 600, // 10 mins
    DOCUMENT_UPLOAD_EXPIRATION_DURATION: 300 // 5 mins
}
  
export const getAuditEvent = (
        documentid: string,
        version: string,
        event: string, 
        eventtime: string, 
        eventinitiator: string, 
        initiatorsystemcode: string,
        eventinitiatorip: string) => {
    return  {
        auditid: generateUUID(),
        documentid,
        version,
        event,
        eventtime,
        eventinitiator,
        eventinitiatorip,
        initiatorsystemcode
      }
}
export const getAuditEventCode = (documentStatus: string): string | undefined => {
    switch (documentStatus) {
        case DocumentStatuses.UPLOADED:
        case DocumentStatuses.PENDING_REVIEW:
            return EventCodes.UPLOAD;
        case DocumentStatuses.UNDER_REVIEW:
            return EventCodes.STARTED_VERIFICATION;
        case DocumentStatuses.VERIFIED:
            return EventCodes.VERIFIED;
        case DocumentStatuses.REJECTED:
            return EventCodes.REJECTED;
        default:
            return undefined;
    }
}

export const getCurrentTime = (): string => new Date().getTime().toString();
interface Body {
    [key: string]: any;
}
export const formSuccessBody = (body: Body, resultFields: string[]) => {
    return Object.keys(body)
            .filter(key => resultFields.includes(key))
            .reduce((obj, key) => { 
                obj[key] = body[key];
                return obj;
            }, {} as Body)
};
/**
 * Dynamically calculates name of the DynamoDB table based on document type for which operation is performed
 * @param documentType 
 * @returns 
 */
export const resolveTableName = (documentType: string, tableType: string): string  | undefined => {
    const namePattern = getDocumentTableNamePatternByType(documentType);
    return namePattern?.replace('$1', tableType).replace('$2', '');
}
/**
 * Dynamically calculates name of the DynamoDB table index based on document type for which operation is performed
 * @param documentType 
 * @param indexSuffix 
 * @returns 
 */
export const resolveTableIndexName = (documentType: string, tableType: string, indexSuffix: string): string | undefined => {
    const namePattern = getDocumentTableNamePatternByType(documentType);
    return namePattern?.replace('$1', tableType).replace('$2', `-${indexSuffix}`);
}