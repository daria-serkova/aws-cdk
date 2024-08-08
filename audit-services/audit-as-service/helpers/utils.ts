import { config } from 'dotenv';
config(); 
/**
 * Identifies envrironment of the deployment to minimize AWS cost for non-production environments.
 */
export const isProduction : boolean = process.env.TAG_ENVIRONMENT === 'production';
export enum SupportedDocumentTypes {
    PROVIDERS = 'providers',
    INSURANCE = 'insurance',
    BILLING = 'billing'
}
export enum SupportedHIPAADocumentTypes {
    INSURANCE = 'insurance',
    BILLING = 'billing'
}
export enum SupportedPIIDocumentTypes {
    PROVIDERS = 'providers',
    INSURANCE = 'insurance',
    BILLING = 'billing'
}
export enum SupportedPCIDSSDocumentTypes {
    BILLING = 'billing'
}
export const SupportedDocumentTypesNames: string[] = Object.values(SupportedDocumentTypes);
export const SupportedHIPAADocumentTypesNames: string[] = Object.values(SupportedHIPAADocumentTypes);
export const SupportedPIIDocumentTypesNames: string[] = Object.values(SupportedPIIDocumentTypes);
export const SupportedPCIDSSDocumentTypesNames: string[] = Object.values(SupportedPCIDSSDocumentTypes);
