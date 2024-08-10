import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { ResourceName } from '../lib/resource-reference';
config(); 

// Identifies envrironment of the deployment to minimize AWS cost for non-production environments.
export const isProduction : boolean = process.env.TAG_ENVIRONMENT === 'production';
/*
 * Generates a unique UUID value.
 * @returns {string} - A UUID string representing a unique identifier for the dynamoDB record or for S3 object.
 */
export const generateUUID = () : string => uuidv4();

/**
 * Enumeration representing the supported system codes for systems, that can generate audit events, managed by Audit Service.
 * Each entry maps a specific application, module within it and application type to its corresponding code string.
 *
 * - `ABC_DE_WEB_APPLICATION`: Represents the code for the ABC_DE web application system.
 * - `ABC_DE_MBL_APPLICATION`: Represents the code for the ABC_DE mobile application system.
 */
export enum SupportedInitiatorSystemCodes {
    ABC_DE_WEB_APPLICATION = 'ABC_DE_WEB',
    ABC_DE_MBL_APPLICATION = 'ABC_DE_MBL',
}
export const SupportedInitiatorSystemCodesValues: string[] = Object.values(SupportedInitiatorSystemCodes);

export enum SupportedEventTypes {
    // OTP Related Activities
    OTP_GENERATED = 'OTP_GENERATED', // Indicates that an OTP code was generated for a user action (e.g., registration, login, password change).
    OTP_SENT = 'OTP_SENT', // Indicates that the generated OTP code was sent to the user's phone.
    OTP_VALIDATION_SUCCESS = 'OTP_VALIDATION_SUCCESS', // Indicates that the OTP code was successfully validated by the user.
    OTP_VALIDATION_FAILED = 'OTP_VALIDATION_FAILED',   // Indicates that the OTP code validation failed (e.g., incorrect OTP entered).
    // Login Attempts
    LOGIN_SUCCESSFUL = 'LOGIN_SUCCESSFUL',             // Indicates a successful login to system.
    LOGIN_FAILED = 'LOGIN_FAILED',                     // Indicates a failed login attempt.
    MULTIPLE_LOGIN_FAILED = 'MULTIPLE_LOGIN_FAILED',   // Indicates multiple consecutive failed login attempts.
    ACCOUNT_LOCKOUT = 'ACCOUNT_LOCKOUT',               // Indicates multiple consecutive failed login attempts.
    // Logout and Session Management
    SESSION_REFRESH = 'SESSION_REFRESH',               // Indicates that the session has been successfully refreshed due to user activity.
    SESSION_EXPIRED = 'SESSION_EXPIRED',               // Indicates that a session has expired due to inactivity and the user has been automatically logged out.
    // User Account Management
    USER_ACCOUNT_CREATED = 'USER_ACCOUNT_CREATED',     // Indicates the creation of a new user account.
    USER_ACCOUNT_MODIFIED = 'USER_ACCOUNT_MODIFIED',    // Indicates modifications to an existing user account, such as changes to privileges.
    USER_ACCOUNT_DELETED = 'USER_ACCOUNT_DELETED',     // Indicates the deletion or deactivation of a user account.
    ROLE_ASSIGNED = 'ROLE_ASSIGNED',                   // Indicates the assignment of a role or privilege to a user.
    ROLE_REVOKED = 'ROLE_REVOKED',                     // Indicates the revocation of a role or privilege from a user.
    // Password Management
    PASSWORD_CHANGED = 'PASSWORD_CHANGED',             // Indicates a successful change of a user password.
    PASSWORD_CHANGE_FAILED = 'PASSWORD_CHANGE_FAILED', // Indicates a failed attempt to change a user password.
    PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED' // Indicates a password reset request.
}
// Define the interface for database details
interface DatabaseDetails {
    tableName: string;
    indexByUserIdName: string;
    indexByIpName: string;
}

// Define the categories for which we have database details
type DatabaseCategory = 'userAccess' //| 'documents' | 'patient'; // Add more categories as needed

// Define the database details for each category
const databaseDetails: Record<DatabaseCategory, DatabaseDetails> = {
    userAccess: {
        tableName: ResourceName?.dynamodb?.AUDIT_EVENTS_USER_ACCESS,
        indexByUserIdName: ResourceName?.dynamodb?.AUDIT_EVENTS_USER_ACCESS_INDEX_BY_USER_ID,
        indexByIpName: ResourceName?.dynamodb?.AUDIT_EVENTS_USER_ACCESS_INDEX_BY_IP
    },
    // Add entries for other categories like DOCUMENTS_EVENTS, PATIENT_EVENTS, etc.
};

// Map event types to their categories
const eventCategoryMappings: Record<string, DatabaseCategory> = {
    [SupportedEventTypes.OTP_GENERATED]: 'userAccess',
    [SupportedEventTypes.OTP_SENT]: 'userAccess',
    [SupportedEventTypes.OTP_VALIDATION_SUCCESS]: 'userAccess',
    [SupportedEventTypes.OTP_VALIDATION_FAILED]: 'userAccess',
    [SupportedEventTypes.LOGIN_SUCCESSFUL]: 'userAccess',
    [SupportedEventTypes.LOGIN_FAILED]: 'userAccess',
    [SupportedEventTypes.MULTIPLE_LOGIN_FAILED]: 'userAccess',
    [SupportedEventTypes.ACCOUNT_LOCKOUT]: 'userAccess',
    [SupportedEventTypes.SESSION_REFRESH]: 'userAccess',
    [SupportedEventTypes.SESSION_EXPIRED]: 'userAccess',
    [SupportedEventTypes.USER_ACCOUNT_CREATED]: 'userAccess',
    [SupportedEventTypes.USER_ACCOUNT_MODIFIED]: 'userAccess',
    [SupportedEventTypes.USER_ACCOUNT_DELETED]: 'userAccess',
    [SupportedEventTypes.ROLE_ASSIGNED]: 'userAccess',
    [SupportedEventTypes.ROLE_REVOKED]: 'userAccess',
    [SupportedEventTypes.PASSWORD_CHANGED]: 'userAccess',
    [SupportedEventTypes.PASSWORD_CHANGE_FAILED]: 'userAccess',
    [SupportedEventTypes.PASSWORD_RESET_REQUESTED]: 'userAccess',
    // Add mappings for DOCUMENTS_EVENTS, PATIENT_EVENTS, etc.
};

// Function to get database details based on event type
export const getDatabaseDetails = (eventType: string): DatabaseDetails | null => {
    const category = eventCategoryMappings[eventType];
    return category ? databaseDetails[category] : null;
};
// Real time auditing is set for 30 days only. All records will be moved to S3 for long-term storage after that.
export const getTtlValue = (eventTimestamp: string) : string => {
    const timestamp = parseInt(eventTimestamp);
    const date = new Date(timestamp);
    date.setDate(date.getDate() + 30);
    return date.getTime().toString();
}


export const SupportedEventTypesValues: string[] = Object.values(SupportedEventTypes);
/**
 * Object containing supported regular expression patterns for parameter validation.
 *
 * - `IP`: Regular expression pattern for validating IPv4 addresses.
 *   - Matches IPv4 addresses in the format `xxx.xxx.xxx.xxx` where each `xxx` is a number from 0 to 255.
 *   - Example of a valid IP address: `192.168.1.1`.
 */
export const SupportedParamsPatterns = {
    IP: '^((25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$',
    TIMESTAMP: '^[0-9]+$'
}
export const formatAuditEvent = (data: Record<string, any>): { deviceDetails: Record<string, any>, otherDetails: Record<string, any> } => {
    const deviceDetails: Record<string, any> = {};
    const otherDetails: Record<string, any> = {};

    Object.keys(data).forEach(key => {
        if (key.startsWith('device')) {
            deviceDetails[key] = data[key];
        } else {
            otherDetails[key] = data[key];
        }
    });

    return { deviceDetails, otherDetails };
};
export enum SupportedOtpPurposes {
    LOGIN = 'LOGIN',
    REGISTRATION = 'REGISTRATION',
    PASSWORD_CHANGE = 'PASSWORD_CHANGE'
}
export const SupportedOtpPurposesValues: string[] = Object.values(SupportedOtpPurposes);

export enum SupportedOtpMediums {
    EMAIL = 'EMAIL',
    PHONE = 'PHONE'
}
export const SupportedOtpMediumsValues: string[] = Object.values(SupportedOtpMediums);

export enum SupportedOtpValidationFailureCodes {
    INVALID_OTP = 'INVALID_OTP',
    EXPIRED_OTP = 'EXPIRED_OTP',
    OTP_NOT_FOUND = 'OTP_NOT_FOUND'
}
export const SupportedOtpValidationFailureCodesValues: string[] = Object.values(SupportedOtpValidationFailureCodes);

export enum SupportedLoginMethods {
    PASSWORD = 'PASSWORD',
    SSO = 'SSO',
    MFA = 'MFA'
}
export const SupportedLoginMethodsValues: string[] = Object.values(SupportedLoginMethods);














/**
 * Full list of document types managed by services, connected to Audit Service
 */
export enum SupportedDocumentTypes {
    PROVIDERS = 'providers',
    INSURANCE = 'insurance',
    BILLING = 'billing'
}
/**
 * In the context of HIPAA (Health Insurance Portability and Accountability Act), the primary focus is on protecting 
 * the privacy and security of health information. Among the document types listed, the following are generally considered 
 * to be within the scope of HIPAA:
 */
export enum SupportedHIPAADocumentTypes {
    INSURANCE = 'insurance',
    BILLING = 'billing'
}
/**
 * PII (Personally Identifiable Information) refers to any information that can be used to identify an individual. 
 * PII is broader than HIPAA and can include data protected under various regulations depending on its context and use. 
 * All these document types could be subject to regulations protecting PII, which might include laws like 
 * GDPR (General Data Protection Regulation) for European data or various state-level privacy laws in the U.S.
 */
export enum SupportedPIIDocumentTypes {
    PROVIDERS = 'providers',
    INSURANCE = 'insurance',
    BILLING = 'billing'
}
/**
 * PCI-DSS (Payment Card Industry Data Security Standard) focuses on securing credit card and payment information. 
 * Typically within PCI-DSS scope are following types of documents as they might contain payment card information.
 */
export enum SupportedPCIDSSDocumentTypes {
    BILLING = 'billing'
}
export const SupportedDocumentTypesValues: string[] = Object.values(SupportedDocumentTypes);
export const SupportedHIPAADocumentTypesValues: string[] = Object.values(SupportedHIPAADocumentTypes);
export const SupportedPIIDocumentTypesValues: string[] = Object.values(SupportedPIIDocumentTypes);
export const SupportedPCIDSSDocumentTypesValues: string[] = Object.values(SupportedPCIDSSDocumentTypes);

