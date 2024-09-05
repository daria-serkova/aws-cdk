import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import Ajv from 'ajv';
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
 */
export enum SupportedInitiatorSystemCodes {
    // Represents the code for the CRM web application system
    CRM_WEB_APPLICATION = 'CRM_WEB',
    // Represents the code for the CRM mobile application system.
    CRM_MBL_APPLICATION = 'CRM_MBL',
}
export const SupportedInitiatorSystemCodesValues: string[] = Object.values(SupportedInitiatorSystemCodes);





export enum SupportedEventTypes {
    /* === OTP Related Activities === */
    // Indicates that an OTP code was generated for a user action (e.g., registration, login, password change).
    OTP_GENERATED = 'OTP_GENERATED',
    // Indicates that the OTP code was successfully validated by the user.
    OTP_VALIDATION_SUCCESS = 'OTP_VALIDATION_SUCCESS',
    // Indicates that the generated OTP code was sent to the user's phone or email
    OTP_SENT = 'OTP_SENT',
    // Indicates that the OTP code validation failed (e.g., incorrect OTP entered).
    OTP_VALIDATION_FAILED = 'OTP_VALIDATION_FAILED',
    
    /* === Login Attempts === */
    // Indicates a successful login to system.
    LOGIN_SUCCESSFUL = 'LOGIN_SUCCESSFUL',
    // Indicates a failed login attempt.
    LOGIN_FAILED = 'LOGIN_FAILED',
    // Indicates multiple consecutive failed login attempts.
    MULTIPLE_LOGIN_FAILED = 'MULTIPLE_LOGIN_FAILED',
    // Indicates multiple consecutive failed login attempts.
    ACCOUNT_LOCKOUT = 'ACCOUNT_LOCKOUT',
    
    /* === Logout and Session Management === */
    // Indicates that a user successfully logged out of the system.
    LOGOUT_SUCCESSFUL = 'LOGOUT_SUCCESSFUL',
    // Indicates that the session has been successfully refreshed due to user activity.
    SESSION_REFRESH = 'SESSION_REFRESH',
    // Indicates that a session has expired due to inactivity and the user has been automatically logged out.               
    SESSION_EXPIRED = 'SESSION_EXPIRED',
    
    /* === User Account Management === */
    // Indicates the creation of a new user account.
    USER_ACCOUNT_CREATED = 'USER_ACCOUNT_CREATED',
    // Indicates modifications to an existing user account, such as changes to privileges.
    USER_ACCOUNT_MODIFIED = 'USER_ACCOUNT_MODIFIED',
    // Indicates the deletion or deactivation of a user account.
    USER_ACCOUNT_DELETED = 'USER_ACCOUNT_DELETED',
    // Indicates the assignment of a role or privilege to a user.
    ROLE_ASSIGNED = 'ROLE_ASSIGNED',
    // Indicates the revocation of a role or privilege from a user.
    ROLE_REVOKED = 'ROLE_REVOKED',
    
    /* === Password Management === */
    // Indicates a successful change of a user password.
    PASSWORD_CHANGED = 'PASSWORD_CHANGED',
    // Indicates a failed attempt to change a user password.
    PASSWORD_CHANGE_FAILED = 'PASSWORD_CHANGE_FAILED',
    // Indicates a password reset request.
    PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
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
    [SupportedEventTypes.LOGOUT_SUCCESSFUL]: 'userAccess',
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

const ttlDays : number = isProduction ? 30 : 1;
// Real time auditing is set for 30 days only. All records will be moved to S3 for long-term storage after that.
export const getTtlValue = (eventTimestamp: string) : string => {
    const timestamp = parseInt(eventTimestamp);
    const date = new Date(timestamp);
    date.setDate(date.getDate() + ttlDays);
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
 * List of possible SupportedLoginFailuresCodes that could be used 
 * in applications for tracking different reasons why a login might fail:
 */
export enum SupportedLoginFailuresCodes {
    // The username provided is incorrect.
    USERNAME_NOT_FOUND = 'USERNAME_NOT_FOUND',
    // The password provided is incorrect.
    INCORRECT_PASSWORD = 'INCORRECT_PASSWORD',
    // The account has been locked due to too many failed login attempts or administrative action.
    ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
    // The account has been disabled and cannot be used for login.
    ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
    // The account has expired and requires renewal or reactivation.
    ACCOUNT_EXPIRED = 'ACCOUNT_EXPIRED',
    // The provided multi-factor authentication code is incorrect or expired.
    MFA_FAILED = 'MFA_FAILED',
    // Multi-factor authentication is required but was not provided.
    MFA_REQUIRED = 'MFA_REQUIRED',
    // The password has expired and must be reset before login is allowed.
    PASSWORD_EXPIRED = 'PASSWORD_EXPIRED',
    // The login attempt was made from an unauthorized IP address or range.
    UNAUTHORIZED_IP = 'UNAUTHORIZED_IP',
    // The login attempt was made from an unauthorized device.
    UNAUTHORIZED_DEVICE = 'UNAUTHORIZED_DEVICE',
    // The login attempt was made from an unauthorized geographical location.
    UNAUTHORIZED_LOCATION = 'UNAUTHORIZED_LOCATION',
    // The session has expired and the user needs to log in again.
    SESSION_EXPIRED = 'SESSION_EXPIRED',
    // The login failed due to too many failed attempts in a short period.
    TOO_MANY_ATTEMPTS = 'TOO_MANY_ATTEMPTS',
    // A CAPTCHA challenge was required but not completed.
    CAPTCHA_REQUIRED = 'CAPTCHA_REQUIRED',
    // The CAPTCHA challenge was completed incorrectly.
    CAPTCHA_FAILED = 'CAPTCHA_FAILED',
    // The session is invalid, possibly due to tampering or expiration.
    INVALID_SESSION = 'INVALID_SESSION',
    // The password being used has been reused from a previous password and is not allowed.
    PASSWORD_REUSE_DETECTED = 'PASSWORD_REUSE_DETECTED',
    // The password does not meet complexity requirements.
    PASSWORD_COMPLEXITY_FAILED = 'PASSWORD_COMPLEXITY_FAILED',
    // The login attempt via a social authentication provider (e.g., Google, Facebook) failed.
    SOCIAL_AUTH_FAILED = 'SOCIAL_AUTH_FAILED',                 
    // The login attempt via Single Sign-On (SSO) failed.
    SSO_AUTH_FAILED = 'SSO_AUTH_FAILED',

}
// Arary of possible SupportedLoginFailuresCodes for Request Model checks
export const SupportedLoginFailuresCodesValues: string[] = Object.values(SupportedLoginFailuresCodes);

/**
 * Various states related to the locking and unlocking of user accounts.
 */
 export enum SupportedAccountLockStatuses {
    // The account is not locked and is accessible by the user.
    UNLOCKED = 'UNLOCKED', 
    // The account is locked, typically due to multiple failed login attempts or a security policy.
    LOCKED = 'LOCKED', 
    // The account is temporarily locked for a specific duration, often due to multiple failed login attempts.
    TEMPORARILY_LOCKED = 'TEMPORARILY_LOCKED',
    // The account is permanently locked, usually requiring administrative intervention to unlock.
    PERMANENTLY_LOCKED = 'PERMANENTLY_LOCKED',
    // The account is locked by an administrator, possibly for security reasons or policy enforcement.
    LOCKED_DUE_TO_ADMIN = 'LOCKED_DUE_TO_ADMIN',
    // The account is locked due to detection of suspicious activity, such as unusual login patterns or failed attempts.
    LOCKED_DUE_TO_SUSPICIOUS_ACTIVITY = 'LOCKED_DUE_TO_SUSPICIOUS_ACTIVITY',
    // The account is locked to comply with regulatory or organizational policies.
    LOCKED_DUE_TO_COMPLIANCE = 'LOCKED_DUE_TO_COMPLIANCE', 
    // The account is locked because the user’s password has expired and needs to be updated.
    LOCKED_DUE_TO_PASSWORD_EXPIRY = 'LOCKED_DUE_TO_PASSWORD_EXPIRY',
    // The account is locked due to prolonged inactivity, requiring reactivation.
    LOCKED_DUE_TO_INACTIVE_STATUS = 'LOCKED_DUE_TO_INACTIVE_STATUS', 
    // The account is locked due to failure in Multi-Factor Authentication (MFA) processes.
    LOCKED_DUE_TO_MFA_FAILURE = 'LOCKED_DUE_TO_MFA_FAILURE',
    // The account is locked pending some form of verification, such as email confirmation or identity verification.
    LOCKED_PENDING_VERIFICATION = 'LOCKED_PENDING_VERIFICATION',
    // The account is locked due to detection of fraudulent activity.
    LOCKED_DUE_TO_FRAUD_DETECTION = 'LOCKED_DUE_TO_FRAUD_DETECTION' 
 }
// Array of possible SupportedAccountLockStatuses for Request Model checks
export const SupportedAccountLockStatusesValues: string[] = Object.values(SupportedAccountLockStatuses);

/**
 * Various reasons related to the locking of user accounts.
 */
export enum SupportedAccountLockReasons {
    // The account was locked due to multiple failed login attempts within a specified period.
    TOO_MANY_FAILED_LOGINS = 'TOO_MANY_FAILED_LOGINS',
    // The account was locked due to detected suspicious or unusual activity, such as login attempts from different geographical locations or devices.
    SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
    // The account was locked by an administrator or system operator, possibly for security or policy reasons.
    ADMINISTRATIVE_ACTION = 'ADMINISTRATIVE_ACTION',
    // The account was locked to prevent potential fraud or unauthorized access.
    FRAUD_PREVENTION = 'FRAUD_PREVENTION',
    // The account was temporarily locked as part of an account recovery or password reset process.
    ACCOUNT_RECOVERY_PROCESS = 'ACCOUNT_RECOVERY_PROCESS',
    // The account was locked due to the detection of a brute-force attack.
    BRUTE_FORCE_ATTACK_DETECTED = 'BRUTE_FORCE_ATTACK_DETECTED',
    // The account was locked due to a violation of security policies, such as attempting to access restricted areas of the system.
    SECURITY_POLICY_VIOLATION = 'SECURITY_POLICY_VIOLATION',
    // The account was locked because the user's password expired and needs to be reset.
    PASSWORD_EXPIRATION = 'PASSWORD_EXPIRATION',
    // The account was locked because the device used to access it was suspected of being compromised or infected with malware.
    DEVICE_COMPROMISE = 'DEVICE_COMPROMISE',
    // The account was suspended, leading to a lockout, often due to terms of service violations or legal issues.
    ACCOUNT_SUSPENSION = 'ACCOUNT_SUSPENSION', 
}
// Array of possible SupportedAccountLockReasons for Request Model checks
 export const SupportedAccountLockReasonsValues: string[] = Object.values(SupportedAccountLockReasons);










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

const AuditEventSchema = {
    type: 'object',
    properties: {
        initiatorsystemcode: { type: 'string', enum: SupportedInitiatorSystemCodesValues },
        requestorid: { type: 'string' },
        requestorip: { type: 'string', pattern: SupportedParamsPatterns.IP },
        eventtype: { type: 'string', enum: SupportedEventTypesValues },
        timestamp: { type: 'string', pattern: SupportedParamsPatterns.TIMESTAMP },

        devicetype: { type: 'string' },
        devicemodel: { type: 'string' },
        devicebrowsername: { type: 'string' },
        deviceosname: { type: 'string' },
        deviceosversion: { type: 'string' },

        otppurpose: { type: 'string', enum: SupportedOtpPurposesValues },
        otpmedium: { type: 'string', enum: SupportedOtpMediumsValues },
        otpexpirationtime: { type: 'string', pattern: SupportedParamsPatterns.TIMESTAMP },
        otprecipient: { type: 'string' },
        otpvalidationfailurecode: { type: 'string', enum: SupportedOtpValidationFailureCodesValues },
        relatedeventid: { type: 'string' },

        loginmethod: { type: 'string', enum: SupportedLoginMethodsValues }, 
        loginfailurecode: { type: 'string', enum: SupportedLoginFailuresCodesValues },
        loginpreviousfailedattempts: { type: 'number' },

        sessionid: { type: 'string' },
        sessionstarttime: { type: 'string', pattern: SupportedParamsPatterns.TIMESTAMP },
        sessionexpirationtime: { type: 'string', pattern: SupportedParamsPatterns.TIMESTAMP },
        sessionidold: { type: 'string' },
        sessionstarttimeold: { type: 'string', pattern: SupportedParamsPatterns.TIMESTAMP }, 
        sessionexpirationtimeold: { type: 'string', pattern: SupportedParamsPatterns.TIMESTAMP },
        sessionidnew: { type: 'string' },
        sessionstarttimenew: { type: 'string', pattern: SupportedParamsPatterns.TIMESTAMP },
        sessionexpirationtimenew: { type: 'string', pattern: SupportedParamsPatterns.TIMESTAMP },

        accountlockstatus: { type: 'string', enum: SupportedAccountLockStatusesValues },
        accountlockduration: { type: 'number' },
        accountlockreason: { type: 'string', enum: SupportedAccountLockReasonsValues },

    },
    required: ['initiatorsystemcode', 'requestorid', 'requestorip', 'eventtype', 'timestamp'],
    additionalProperties: false
};

export const validateAuditEvent = (eventData: any) => {
    const ajv = new Ajv();
    const validate = ajv.compile(AuditEventSchema);
    const valid = validate(eventData);
    return {
        isValid: valid,
        errors: validate.errors
    }
}