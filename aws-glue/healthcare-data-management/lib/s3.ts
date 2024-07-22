import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { isProduction } from '../helpers/utilities';
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import path = require('path');
const folders = [
    /* Contains raw data from various healthcare systems */
    'raw/ehr/patient_data', 
    'raw/ehr/clinical_trials',
    'raw/ehr/lab_results',
    'raw/billing/claims',
    'raw/billing/payments',
    'raw/external/',

    /* Contains data after initial processing or transformation. */
    'processed/ehr/patient_data',
    'processed/ehr/clinical_trials',
    'processed/ehr/lab_results',
    'processed/billing/claims',
    'processed/billing/payments',
    'processed/external',
    
    /* Data ready for analytics purposes */
    'curated/analytics/ehr/patient_data',
    'curated/analytics/ehr/clinical_trials',
    'curated/analytics/ehr/lab_results',
    'curated/analytics/billing/claims',
    'curated/analytics/billing/payments',
    'curated/analytics/external',

     /* Data formatted for reporting */
    'curated/reporting/ehr/patient_data',
    'curated/reporting/ehr/clinical_trials',
    'curated/reporting/ehr/lab_results',
    'curated/reporting/billing/claims',
    'curated/reporting/billing/payments',
    'curated/reporting/external',

    /* Historical or archived data that is still important but not frequently accessed */
    'curated/archives/ehr/patient_data',
    'curated/archives/ehr/clinical_trials',
    'curated/archives/ehr/lab_results',
    'curated/archives/billing/claims',
    'curated/archives/billing/payments',
    'curated/archives/external',

    /* Contains logs for monitoring and security */
    'logs/glue_jobs',
    'logs/access_logs',
    'logs/security_audit'
]

/**
 * Function creates and configure S3 bucket.
 * @param scope 
 * @param bucketName 
 * @returns
 */
export function configureResources(scope: Construct, bucketName: string) {
    // Creates S3 bucket
    const s3Bucket = new Bucket(scope, bucketName, {
        bucketName: bucketName,
        encryption: BucketEncryption.S3_MANAGED,
        versioned: true,
        removalPolicy: isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });
    // Creates folders structure
    const sourceDir = path.join(__dirname, '../data');
        folders.forEach(folder => {
            new BucketDeployment(scope, `Deploy-${folder}`, {
                sources: [Source.asset(sourceDir)], // Source directory containing the file to copy
                destinationBucket: s3Bucket,
                destinationKeyPrefix: folder,
                prune: false // Do not delete files from the destination bucket that are not in the source
            });
      });
     
     
   
}