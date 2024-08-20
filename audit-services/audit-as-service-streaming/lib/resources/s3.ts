import { BlockPublicAccess, Bucket, BucketEncryption, EventType, LifecycleRule, StorageClass } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { ResourceName } from "../resource-reference";
import { RemovalPolicy } from "aws-cdk-lib";
import { isProduction } from "../../helpers/utils";

/**
 * Configures S3 resources for the application.
 */

export default function configureS3Resources(scope: Construct) {
    const bucket = new Bucket(scope, ResourceName.s3.AUDIT_EVENTS_STORAGE, {
        bucketName: ResourceName.s3.AUDIT_EVENTS_STORAGE,
        encryption: BucketEncryption.S3_MANAGED,
        versioned: true,
        removalPolicy: isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
        autoDeleteObjects: !isProduction,
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });
}