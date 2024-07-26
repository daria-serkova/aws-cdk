import { BlockPublicAccess, Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { ResourceName } from "../resource-reference";
import { isProduction, s3BucketStructure } from "../../helpers/utilities";
import { RemovalPolicy } from "aws-cdk-lib";
import { join } from 'path';
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";

/**
 * Function creates and configure S3 buckets.
 * @param scope 
 */
export function configureS3Resources(scope: Construct) {
    const emailsBucket = new Bucket(scope, ResourceName.s3Buckets.EMAIL_BUCKET, {
        bucketName: ResourceName.s3Buckets.EMAIL_BUCKET,
        encryption: BucketEncryption.S3_MANAGED,
        versioned: true,
        removalPolicy: isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
        autoDeleteObjects: !isProduction,
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });
    const emailsMediaFilesSourceDir = join(__dirname, './../../media-files');
    new BucketDeployment(scope, ResourceName.s3Deployments.EMAIL_BUCKET_MEDIA_FILES_UPLOAD, {
        sources: [
            Source.asset(emailsMediaFilesSourceDir)
        ],
        destinationBucket: emailsBucket,
        destinationKeyPrefix: s3BucketStructure.EMAILS_MEDIA_FILES_LOCATION,
    });
}