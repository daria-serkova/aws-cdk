import { config } from 'dotenv';
import { 
    SupportedDocumentTypesValues, 
    SupportedHIPAADocumentTypesValues,
    SupportedPCIDSSDocumentTypesValues, 
    SupportedPIIDocumentTypesValues
} from '../helpers/utils';
config(); 
// Pattern for API Gateway Request models.
const AWS_REQUEST_MODEL_NAMING_CONVENTION : string = `${process.env.TAG_APPLICATION_CODE?.replace(/-/g, "")}$`;

// Pattern for resources names to keep consistency across all application resources.
const AWS_RESOURCES_NAMING_CONVENTION : string = `${process.env.AWS_RESOURCES_NAME_PREFIX}-${process.env.TAG_ENVIRONMENT}-$`;
// Pattern for resources names to keep consistency across all application resources.
const AWS_LOGS_GROUPS_NAMING_CONVENTION : string = `${process.env.AWS_RESOURCES_NAME_PREFIX}/${process.env.TAG_ENVIRONMENT}/$`;

interface DocumentManagementResources {
    UPLOAD: string;
    VIEW: string;
    METADATA_VIEW: string;
    METADATA_UPDATE?: string;
    VERIFICATION_START?: string;
    VERIFICATION_COMPLETE?: string;
    VERIFICATION_REJECT?: string;
}
interface CloudWatchResources {
    DOCUMENTS_MANAGEMENT: DocumentManagementResources;
    DOCUMENTS_MANAGEMENT_HIPPA: DocumentManagementResources;
    DOCUMENTS_MANAGEMENT_PII: DocumentManagementResources;
    DOCUMENTS_MANAGEMENT_PCI_DSS: DocumentManagementResources;
}
interface ResourceNameStructure {
    cloudWatch: CloudWatchResources;
}

/**
 * Creates name for AWS resource, that match organization's naming convention.
 * @param name - unique AWS resource name
 * @returns string with organization's prefix and unique resource name
 */
const resourceName = (name: string) : string => AWS_RESOURCES_NAMING_CONVENTION.replace('$', name);
/**
 * Creates name for AWS CloudWatch Group, that match organization's naming convention.
 * @param name - unique AWS resource name
 * @returns string with organization's prefix and unique resource name
 */
 const logGroupName = (name: string)  : string => AWS_LOGS_GROUPS_NAMING_CONVENTION.replace('$', name);
/**
 * Creates name for AWS API Gateway Request Model resource, that match organization's naming convention.
 * @param name - unique AWS resource name
 * @returns string with organization's prefix and unique resource name
 */
const requestModelName = (name: string)  : string => AWS_REQUEST_MODEL_NAMING_CONVENTION.replace('$', name);

// Define the ResourceName object
export const ResourceName: ResourceNameStructure = {
    cloudWatch: {
        DOCUMENTS_MANAGEMENT: {
            UPLOAD: logGroupName('$1/Documents/Upload'),
            VIEW: logGroupName('$1/Documents/Access'),
            METADATA_VIEW: logGroupName('$1/Documents/Metadata/Access'),
            METADATA_UPDATE: logGroupName('$1/Documents/Metadata/Update'),
            VERIFICATION_START: logGroupName('$1/Documents/Verification/Start'),
            VERIFICATION_COMPLETE: logGroupName('$1/Documents/Verification/Verify'),
            VERIFICATION_REJECT: logGroupName('$1/Documents/Verification/Reject'),
        },
        DOCUMENTS_MANAGEMENT_HIPPA: {
            UPLOAD: logGroupName('$1/Documents/Upload/HIPAA'),
            VIEW: logGroupName('$1/Documents/Access/HIPAA'),
            METADATA_VIEW: logGroupName('$1/Documents/Metadata/Access/HIPAA'),
        },
        DOCUMENTS_MANAGEMENT_PII: {
            UPLOAD: logGroupName('$1/Documents/Upload/PII'),
            VIEW: logGroupName('$1/Documents/Access/PII'),
            METADATA_VIEW: logGroupName('$1/Documents/Metadata/Access/PII'),
        },
        DOCUMENTS_MANAGEMENT_PCI_DSS: {
            UPLOAD: logGroupName('$1/Documents/Upload/PCI_DSS'),
            VIEW: logGroupName('$1/Documents/Access/PCI_DSS'),
            METADATA_VIEW: logGroupName('$1/Documents/Metadata/Access/PCI_DSS'),
        }
    },
};
// Derive the action keys from ResourceName
const documentManagementActions = Object.keys(ResourceName.cloudWatch.DOCUMENTS_MANAGEMENT) as Array<keyof DocumentManagementResources>;

export const getCloudWatchDocumentsManagementLogsGroups = (): string[] => {
    return SupportedDocumentTypesValues.flatMap(documentType =>
        documentManagementActions
            .filter(action => ResourceName.cloudWatch.DOCUMENTS_MANAGEMENT[action] !== undefined) // Filter out undefined actions
            .map(action => ResourceName.cloudWatch.DOCUMENTS_MANAGEMENT[action]!.replace('$1', documentType))
    );
};
export const getCloudWatchDocumentsManagementHIPAALogsGroups = (): string[] => {
    return SupportedHIPAADocumentTypesValues.flatMap(documentType =>
        documentManagementActions
            .filter(action => ResourceName.cloudWatch.DOCUMENTS_MANAGEMENT_HIPPA[action] !== undefined) // Filter out undefined actions
            .map(action => ResourceName.cloudWatch.DOCUMENTS_MANAGEMENT_HIPPA[action]!.replace('$1', documentType))
    );
};
export const getCloudWatchDocumentsManagementPIILogsGroups = (): string[] => {
    return SupportedPIIDocumentTypesValues.flatMap(documentType =>
        documentManagementActions
            .filter(action => ResourceName.cloudWatch.DOCUMENTS_MANAGEMENT_PII[action] !== undefined) // Filter out undefined actions
            .map(action => ResourceName.cloudWatch.DOCUMENTS_MANAGEMENT_PII[action]!.replace('$1', documentType))
    );
};
export const getCloudWatchDocumentsManagementPCIDSSLogsGroups = (): string[] => {
    return SupportedPCIDSSDocumentTypesValues.flatMap(documentType =>
        documentManagementActions
            .filter(action => ResourceName.cloudWatch.DOCUMENTS_MANAGEMENT_PCI_DSS[action] !== undefined) // Filter out undefined actions
            .map(action => ResourceName.cloudWatch.DOCUMENTS_MANAGEMENT_PCI_DSS[action]!.replace('$1', documentType))
    );
};