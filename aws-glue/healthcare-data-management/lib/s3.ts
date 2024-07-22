import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { isProduction } from '../helpers/utilities';
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
/**
 * Function creates and configure S3 bucket.
 * @param scope 
 * @param bucketName 
 * @returns
 */
export function configureResources(scope: Construct, bucketName: string) {
    // Create an S3 bucket
    const bucket = new Bucket(scope, bucketName, {
        bucketName: bucketName,
        encryption: BucketEncryption.S3_MANAGED,
        versioned: true,
        removalPolicy: isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      });
   
}