import { config } from 'dotenv';
config(); 

// Identifies envrironment of the deployment to minimize AWS cost for non-production environments.
export const isProduction : boolean = process.env.TAG_ENVIRONMENT === 'production';

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
export const SupportedDocumentTypesNames: string[] = Object.values(SupportedDocumentTypes);
export const SupportedHIPAADocumentTypesNames: string[] = Object.values(SupportedHIPAADocumentTypes);
export const SupportedPIIDocumentTypesNames: string[] = Object.values(SupportedPIIDocumentTypes);
export const SupportedPCIDSSDocumentTypesNames: string[] = Object.values(SupportedPCIDSSDocumentTypes);
