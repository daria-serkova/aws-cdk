import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { isProduction } from '../helpers/utilities';
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import path = require('path');
/**
 * Defines S3 folders structure and location of test data files
 * NOTE: S3 skips folder creation if no files are added to it. 
 * This script uploads synthetic data or empty test.txt file if configured as `null` below.
 */
const s3Structure = [
    /* Contains raw data from various healthcare systems */
    { path: 'raw/ehr/patient_data', dataFolder: 'data/ehr/patient_data' }, // Data from https://synthetichealth.github.io/synthea/ 
    { path: 'raw/ehr/clinical_trials', dataFolder: null },
    { path: 'raw/ehr/lab_results', dataFolder: null },
    { path: 'raw/billing/claims', dataFolder: null },
    { path: 'raw/billing/payments', dataFolder: null },
    { path: 'raw/external/', dataFolder: null },

    /* Contains data after initial processing or transformation. */
    { path: 'processed/ehr/patient_data', dataFolder: null },
    { path: 'processed/ehr/clinical_trials', dataFolder: null },
    { path: 'processed/ehr/lab_results', dataFolder: null },
    { path: 'processed/billing/claims', dataFolder: null },
    { path: 'processed/billing/payments', dataFolder: null },
    { path: 'processed/external', dataFolder: null },
    
    /* Data ready for analytics purposes */
    { path: 'curated/analytics/ehr/patient_data', dataFolder: null },
    { path: 'curated/analytics/ehr/clinical_trials', dataFolder: null },
    { path: 'curated/analytics/ehr/lab_results', dataFolder: null },
    { path: 'curated/analytics/billing/claims', dataFolder: null },
    { path: 'curated/analytics/billing/payments', dataFolder: null },
    { path: 'curated/analytics/external', dataFolder: null },

     /* Data formatted for reporting */
    { path: 'curated/reporting/ehr/patient_data', dataFolder: null },
    { path: 'curated/reporting/ehr/clinical_trials', dataFolder: null },
    { path: 'curated/reporting/ehr/lab_results', dataFolder: null },
    { path: 'curated/reporting/billing/claims', dataFolder: null },
    { path: 'curated/reporting/billing/payments', dataFolder: null },
    { path: 'curated/reporting/external', dataFolder: null },

    /* Historical or archived data that is still important but not frequently accessed */
    { path: 'curated/archives/ehr/patient_data', dataFolder: null },
    { path: 'curated/archives/ehr/clinical_trials', dataFolder: null },
    { path: 'curated/archives/ehr/lab_results', dataFolder: null },
    { path: 'curated/archives/billing/claims', dataFolder: null },
    { path: 'curated/archives/billing/payments', dataFolder: null },
    { path: 'curated/archives/external', dataFolder: null },

    /* Contains logs for monitoring and security */
    { path: 'logs/glue_jobs', dataFolder: null },
    { path: 'logs/access_logs', dataFolder: null },
    { path: 'logs/security_audit',  dataFolder: null },
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
    // Creates folders structure and uploads test files into it.
    s3Structure.forEach(folder => {
        const sourceDir = folder.dataFolder ? path.join(__dirname, `../${folder.dataFolder}`) : path.join(__dirname, `../data/test`);
        new BucketDeployment(scope, `Deploy-${folder.path}`, {
            sources: [ Source.asset(sourceDir) ], // Source directory containing the file to copy
            destinationBucket: s3Bucket,
            destinationKeyPrefix: folder.path,
            //prune: false
        });
    });
     
     
   
}