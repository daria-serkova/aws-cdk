import { BlockPublicAccess, Bucket, BucketEncryption, EventType, LifecycleRule, StorageClass } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { ResourceName } from "../resource-reference";
import { isProduction } from "../../helpers/utilities";
import { Duration, RemovalPolicy } from "aws-cdk-lib";
import { documentS3UploadListenerLambda } from "./lambdas";
import { S3EventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { SupportedRejectedFolders, SupportedUploadFolders, SupportedVerifiedFolders } from "../../functions/helpers/utilities";

/**
 * Function creates and configure S3 buckets.
 * @param scope 
 */
export default function configureS3Resources(scope: Construct) {
    // Archive and retention policies for documents in different statuses
    const lifecycleRules: LifecycleRule[] = [];
    
    // Uploaded documents, that are not processed by verification team for some reason
    SupportedUploadFolders.forEach(folder => {
        let name = ResourceName.s3Buckets.LIFECYCLE_RULES.ARCHIVE_AND_REMOVE_UPLOADED_DOCUMENTS.replace('$1', folder.split('/')[0])
        lifecycleRules.push( {
            id: name,
            prefix: folder,
            transitions: [
                {
                    storageClass: StorageClass.GLACIER,
                    transitionAfter: Duration.days(30), // Transition to Glacier after 30 days
                },
            ],
            expiration: Duration.days(365), // Delete after 365 days
            enabled: true,
        },)
    });

    // Verified documents
    SupportedVerifiedFolders.forEach(folder => {
        let name = ResourceName.s3Buckets.LIFECYCLE_RULES.ARCHIVE_AND_REMOVE_VERIFIED_DOCUMENTS.replace('$1', folder.split('/')[0])
        lifecycleRules.push( {
            id: name,
            prefix: folder,
            transitions: [
                {
                    storageClass: StorageClass.GLACIER,
                    transitionAfter: Duration.days(14610), //40 years
                },
            ],
            expiration: Duration.days(18250), // Delete after 50 years
            enabled: true,
        },)
    });
    
    // Rejected documents
    SupportedRejectedFolders.forEach(folder => {
        let name = ResourceName.s3Buckets.LIFECYCLE_RULES.ARCHIVE_AND_REMOVE_REJECTED_DOCUMENTS.replace('$1', folder.split('/')[0])
        lifecycleRules.push( {
            id: name,
            prefix: folder,
            transitions: [
                {
                    storageClass: StorageClass.GLACIER,
                    transitionAfter: Duration.days(30), // One month (assuming enough time for re-upload or dispute processing)
                },
            ],
            expiration: Duration.days(60), // 2 months (assuming enough time for re-upload or dispute processing)
            enabled: true,
        },)
    });
    const bucket = new Bucket(scope, ResourceName.s3Buckets.DOCUMENTS_BUCKET, {
        bucketName: ResourceName.s3Buckets.DOCUMENTS_BUCKET,
        encryption: BucketEncryption.S3_MANAGED,
        versioned: true,
        removalPolicy: isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
        autoDeleteObjects: !isProduction,
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        lifecycleRules: lifecycleRules
    });
    SupportedUploadFolders.forEach(folder => {
        documentS3UploadListenerLambda().addEventSource(new S3EventSource(bucket, {
            events: [EventType.OBJECT_CREATED],
            filters: [{ prefix: `${folder}` }]
        }));
    });

}