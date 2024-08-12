import { config } from 'dotenv';
import { 
    SupportedDocumentTypesValues, 
    SupportedHIPAADocumentTypesValues,
    SupportedPCIDSSDocumentTypesValues, 
    SupportedPIIDocumentTypesValues
} from '../helpers/utils';
config(); 

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
interface ApiGatewayResources {
    GATEWAY: string;
    USAGE_PLAN: string;
    API_KEY: string;
    REQUEST_VALIDATOR: string;
    REQUEST_MODEL_AUDIT_STORE: string;
}
interface IamResources {
    AUDIT_STORE_LAMBDA: string;
}
interface LambdaResources {
    AUDIT_STORE_LAMBDA: string;
}
interface DynamoDbResources {
    AUDIT_EVENTS_USER_ACCESS: string;
    AUDIT_EVENTS_USER_ACCESS_INDEX_BY_USER_ID: string;
    AUDIT_EVENTS_USER_ACCESS_INDEX_BY_IP: string;
}
interface ResourceNameStructure {
    cloudWatch: CloudWatchResources;
    apiGateway: ApiGatewayResources;
    iam: IamResources;
    lambda: LambdaResources;
    dynamodb: DynamoDbResources;
}
// Pattern for API Gateway Request models.
const AWS_REQUEST_MODEL_NAMING_CONVENTION : string = `${process.env.TAG_APPLICATION_CODE?.replace(/-/g, "")}$`;
/**
 * Creates name for AWS API Gateway Request Model resource, that match organization's naming convention.
 * @param name - unique AWS resource name
 * @returns string with organization's prefix and unique resource name
 */
const requestModelName = (name: string)  : string => AWS_REQUEST_MODEL_NAMING_CONVENTION.replace('$', name);

// Pattern for resources names to keep consistency across all application resources.
const AWS_RESOURCES_NAMING_CONVENTION : string = `${process.env.AWS_RESOURCES_NAME_PREFIX}-${process.env.TAG_ENVIRONMENT}-$`;
/**
 * Creates name for AWS resource, that match organization's naming convention.
 * @param name - unique AWS resource name
 * @returns string with organization's prefix and unique resource name
 */
 const resourceName = (name: string) : string => AWS_RESOURCES_NAMING_CONVENTION.replace('$', name);

 // Pattern for resources names to keep consistency across all application resources.
const AWS_LOGS_GROUPS_NAMING_CONVENTION : string = `${process.env.AWS_RESOURCES_NAME_PREFIX}/${process.env.TAG_ENVIRONMENT}/$`;
/**
 * Creates name for AWS CloudWatch Group, that match organization's naming convention.
 * @param name - unique AWS resource name
 * @returns string with organization's prefix and unique resource name
 */
 const logGroupName = (name: string)  : string => AWS_LOGS_GROUPS_NAMING_CONVENTION.replace('$', name);


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
    apiGateway: {
        GATEWAY: resourceName('audit-api'),
        USAGE_PLAN: resourceName('audit-api-usage-plan'),
        API_KEY: resourceName('audit-api-key'),
        REQUEST_VALIDATOR: resourceName('audit-api-request-validator'),
        REQUEST_MODEL_AUDIT_STORE: requestModelName('AuditStore'),
    },
    iam: {
        AUDIT_STORE_LAMBDA: resourceName('audit-store-lbd-role'),
    },
    lambda: {
        AUDIT_STORE_LAMBDA: resourceName('audit-store-lbd'),
    },
    dynamodb: {
        AUDIT_EVENTS_USER_ACCESS: resourceName('audit-events-user-access'),
        AUDIT_EVENTS_USER_ACCESS_INDEX_BY_USER_ID: resourceName('audit-events-user-access-by-user-id'),
        AUDIT_EVENTS_USER_ACCESS_INDEX_BY_IP: resourceName('audit-events-user-access-by-ip')
    }
    
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