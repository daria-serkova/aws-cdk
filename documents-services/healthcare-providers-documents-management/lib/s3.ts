import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { IS_PRODUCTION, MEDIA_FILES_LOCATIONS } from '../helpers/utilities';
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { resourceName } from '../helpers/utilities';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { join } from 'path';
import { addPublicAccessPermissionsToS3Bucket } from './iam';

export const BucketsNames = {
   DOCUMENTS_BUCKET: resourceName('documents').toLowerCase(),
   EMAILS_MEDIA_BUCKET: resourceName('emails-media').toLowerCase(),
}

/**
 * Function creates and configure S3 buckets.
 * @param scope 
 * @param bucketName 
 * @returns
 */
export function configureResources(scope: Construct) {

    new Bucket(scope, BucketsNames.DOCUMENTS_BUCKET, {
        bucketName: BucketsNames.DOCUMENTS_BUCKET,
        encryption: BucketEncryption.S3_MANAGED,
        versioned: true,
        removalPolicy: IS_PRODUCTION ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
        autoDeleteObjects: !IS_PRODUCTION,
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    const emailsMediaFilesBucket = new Bucket(scope, BucketsNames.EMAILS_MEDIA_BUCKET, {
        bucketName: BucketsNames.EMAILS_MEDIA_BUCKET,
        encryption: BucketEncryption.S3_MANAGED,
        versioned: true,
        removalPolicy: IS_PRODUCTION ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
        autoDeleteObjects: !IS_PRODUCTION,
        blockPublicAccess: BlockPublicAccess.BLOCK_ACLS, 
    });
    const emailsMediaFilesSourceDir = join(__dirname, '../media-files/email-templates');
    const deployment = new BucketDeployment(scope, resourceName('upload-emails-media-files'), {
        sources: [
            Source.asset(emailsMediaFilesSourceDir)
        ],
        destinationBucket: emailsMediaFilesBucket,
        destinationKeyPrefix: MEDIA_FILES_LOCATIONS.EMAILS_MEDIA_FILES,
    });
    addPublicAccessPermissionsToS3Bucket(emailsMediaFilesBucket);
}