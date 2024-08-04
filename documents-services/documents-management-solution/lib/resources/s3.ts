import { BlockPublicAccess, Bucket, BucketEncryption, EventType } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { ResourceName } from "../resource-reference";
import { isProduction } from "../../helpers/utilities";
import { RemovalPolicy } from "aws-cdk-lib";
import { documentS3UploadListenerLambda } from "./lambdas";
import { S3EventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { SupportedS3Directories } from "../../functions/helpers/utilities";

/**
 * Function creates and configure S3 buckets.
 * @param scope 
 */
export default function configureS3Resources(scope: Construct) {
    const bucket = new Bucket(scope, ResourceName.s3Buckets.DOCUMENTS_BUCKET, {
        bucketName: ResourceName.s3Buckets.DOCUMENTS_BUCKET,
        encryption: BucketEncryption.S3_MANAGED,
        versioned: true,
        removalPolicy: isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });
    SupportedS3Directories.forEach(folder => {
        documentS3UploadListenerLambda().addEventSource(new S3EventSource(bucket, {
            events: [EventType.OBJECT_CREATED],
            filters: [{ prefix: `${folder}/upload` }]
        }));
    });
}