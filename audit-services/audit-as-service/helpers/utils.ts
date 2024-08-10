import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
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
    OTP_SENT_EMAIL = 'OTP_SENT_EMAIL', // Indicates that the generated OTP code was sent to the user's email.
    OTP_SENT_PHONE = 'OTP_SENT_PHONE', // Indicates that the generated OTP code was sent to the user's phone.
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
export const SupportedEventTypesValues: string[] = Object.values(SupportedEventTypes);
/**
 * Object containing supported regular expression patterns for parameter validation.
 *
 * - `IP`: Regular expression pattern for validating IPv4 addresses.
 *   - Matches IPv4 addresses in the format `xxx.xxx.xxx.xxx` where each `xxx` is a number from 0 to 255.
 *   - Example of a valid IP address: `192.168.1.1`.
 */
export const SupportedParamsPatterns = {
    IP: "^((25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$"
}














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

