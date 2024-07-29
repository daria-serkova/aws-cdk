import { BlockPublicAccess, Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { ResourceName } from "../resource-reference";
import { isProduction } from "../../helpers/utilities";
import { RemovalPolicy } from "aws-cdk-lib";

/**
 * Function creates and configure S3 buckets.
 * @param scope 
 */
export default function configureS3Resources(scope: Construct) {
    new Bucket(scope, ResourceName.s3Buckets.DOCUMENTS_BUCKET, {
        bucketName: ResourceName.s3Buckets.DOCUMENTS_BUCKET,
        encryption: BucketEncryption.S3_MANAGED,
        versioned: true,
        removalPolicy: isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });
}