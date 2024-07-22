import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { join } from 'path';
import { isProduction } from '../helpers/utilities';
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';

const defaultTestFileLocation = 'data/test';
/**
 * Defines S3 folders structure and location of test data files.
 * NOTE: S3 skips folder creation if no files are added to it. If no specific files are configured - empty test.txt file is uploaded.
 */
const s3Structure = [
    /* Folder for storing credential-related documents */
    { path: 'providers/provider_id/credentials/submitted', dataFolder: defaultTestFileLocation }, 
    { path: 'providers/provider_id/credentials/verified', dataFolder: defaultTestFileLocation }, 
    { path: 'providers/provider_id/credentials/rejected', dataFolder: defaultTestFileLocation }, 

    /* Folder for background check documents */
    { path: 'providers/provider_id/background_check/submitted', dataFolder: defaultTestFileLocation }, 
    { path: 'providers/provider_id/background_check/verified', dataFolder: defaultTestFileLocation }, 
    { path: 'providers/provider_id/background_check/rejected', dataFolder: defaultTestFileLocation }, 

    /*  Folder for any additional documents that the provider might need to submit */
    { path: 'providers/provider_id/additional_documents/submitted', dataFolder: defaultTestFileLocation }, 
    { path: 'providers/provider_id/additional_documents/verified', dataFolder: defaultTestFileLocation }, 
    { path: 'providers/provider_id/additional_documents/rejected', dataFolder: defaultTestFileLocation }, 
 
    /* Folder for storing the provider's profile-related documents */
    { path: 'providers/provider_id/profile', dataFolder: defaultTestFileLocation },    
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
        const sourceDir = join(__dirname, `../${folder.dataFolder}`);
        new BucketDeployment(scope, `${folder.path}`, {
            sources: [Source.asset(sourceDir)],
            destinationBucket: s3Bucket,
            destinationKeyPrefix: folder.path,
        });
    });
}