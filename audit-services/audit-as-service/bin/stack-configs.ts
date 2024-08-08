
import { StackProps } from 'aws-cdk-lib';
import { config } from 'dotenv';
config(); 
const undefinedValue = "undefined";
const environmentConfig: StackProps = {
    env: {
        account: process.env.AWS_ACCOUNT,
        region: process.env.AWS_REGION,
    },
    stackName: process.env.AWS_RESOURCES_NAME_PREFIX,
    description: "Audit as a Service (AaaS)",  
    tags: { // Required tags for all stack resources
        Environment: process.env.TAG_ENVIRONMENT ? process.env.TAG_ENVIRONMENT : undefinedValue,
        Region: process.env.AWS_REGION ? process.env.AWS_REGION : undefinedValue,
        Industry: process.env.TAG_INDUSTRY ? process.env.TAG_INDUSTRY : undefinedValue,
        Solution: process.env.TAG_SOLUTION ? process.env.TAG_SOLUTION : undefinedValue,
        SolutionCode: process.env.TAG_SOLUTION_CODE ? process.env.TAG_SOLUTION_CODE : undefinedValue,
        Application: process.env.TAG_APPLICATION ? process.env.TAG_APPLICATION : undefinedValue,
        ApplicationCode: process.env.TAG_APPLICATION_CODE ? process.env.TAG_APPLICATION_CODE : undefinedValue,
        ClientName: process.env.TAG_CLIENT_NAME ? process.env.TAG_CLIENT_NAME : undefinedValue,
        ClientCode: process.env.TAG_CLIENT_CODE ? process.env.TAG_CLIENT_CODE : undefinedValue,
        Compliance: process.env.TAG_COMPLIANCE ? process.env.TAG_COMPLIANCE : undefinedValue,
        DataSecurityLevel: process.env.TAG_SECURITY_LEVEL ? process.env.TAG_SECURITY_LEVEL : undefinedValue,
        BackupPolicy: process.env.TAG_BACKUP_POLICY ? process.env.TAG_BACKUP_POLICY : undefinedValue,
        BackupRetentionPolicy: process.env.TAG_BACKUP_RETENTION_POLICY ? process.env.TAG_BACKUP_RETENTION_POLICY : undefinedValue,
        Lifecycle: process.env.TAG_LIFECYCLE ? process.env.TAG_LIFECYCLE : undefinedValue,
        DataResidency: process.env.APP_COUNTRY_VERSION || undefinedValue
    }
}
export default environmentConfig;