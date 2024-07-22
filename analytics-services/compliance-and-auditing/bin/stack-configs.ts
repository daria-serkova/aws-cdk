
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
dotenv.config(); 
const undefinedValue = "undefined";
const environmentConfig: cdk.StackProps = {
    env: {
        account: process.env.AWS_ACCOUNT,
        region: process.env.AWS_REGION,
    },
    stackName: process.env.AWS_RESOURCES_NAME_PREFIX,
    description: "AWS Glue infrastructure setup for Compliance and Auditing business scenario",  
    tags: { // Required tags for all stack resources
        Environment: process.env.TAG_ENVIRONMENT ? process.env.TAG_ENVIRONMENT : undefinedValue,
        Region: process.env.AWS_REGION ? process.env.AWS_REGION : undefinedValue,
        Compliance: process.env.TAG_COMPLIANCE ? process.env.TAG_COMPLIANCE : undefinedValue,
        DataSecurityLevel: process.env.TAG_SECURITY_LEVEL ? process.env.TAG_SECURITY_LEVEL : undefinedValue,
        BackupPolicy: process.env.TAG_BACKUP_POLICY ? process.env.TAG_BACKUP_POLICY : undefinedValue,
        BackupRetentionPolicy: process.env.TAG_BACKUP_RETENTION_POLICY ? process.env.TAG_BACKUP_RETENTION_POLICY : undefinedValue,
        Lifecycle: process.env.TAG_LIFECYCLE ? process.env.TAG_LIFECYCLE : undefinedValue,
        DataResidency: process.env.APP_COUNTRY_VERSION || undefinedValue
    }
}
export default environmentConfig;