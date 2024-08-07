import { BlockPublicAccess, Bucket, BucketEncryption, EventType, LifecycleRule, StorageClass } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { ResourceName } from "../resource-reference";
import { isProduction } from "../../helpers/utilities";
import { Duration, RemovalPolicy } from "aws-cdk-lib";
import { documentS3UploadListenerLambda } from "./lambdas";
import { S3EventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { DocumentStatusFolderNames, SupportedUploadFolders } from "../../functions/helpers/utilities";

/**
 * Function creates and configure S3 buckets.
 * @param scope 
 */
export default function configureS3Resources(scope: Construct) {
    // Archive and retention policies for documents in different statuses
    const lifecycleRules: LifecycleRule[] = [];
    
    // Uploaded documents, that are not processed by verification team for some reason
    lifecycleRules.push({
        id: ResourceName.s3Buckets.LIFECYCLE_RULES.ARCHIVE_AND_REMOVE_UPLOADED_DOCUMENTS,
        prefix: `*/${DocumentStatusFolderNames.UPLOADED}/`,
        transitions: [
            {
                storageClass: StorageClass.GLACIER,
                /* 
                 * Transition to Glacier after 60 days assuming this is maximum period for verification process
                 */
                transitionAfter: Duration.days(60),
            },
        ],
        /* 
         * Removal after 365 days after upload
         * Assuming document is abandoned for some reason and will not be processed by verification team.
         */
        expiration: Duration.days(365), 
        enabled: true,
    })
    // Verified documents (active)
    lifecycleRules.push({
        id: ResourceName.s3Buckets.LIFECYCLE_RULES.ARCHIVE_AND_REMOVE_VERIFIED_DOCUMENTS,
        prefix: `*/${DocumentStatusFolderNames.VERIFIED}/`,
        transitions: [
            {
                storageClass: StorageClass.GLACIER,
                 /* 
                 * Transition to Glacier 40 years after verification
                 * TBD update with regulation specific number
                 */
                transitionAfter: Duration.days(14610),
            },
        ],
        /* 
         * Removal after 50 years after verification completed
         * TBD update with regulation specific number
         */
        expiration: Duration.days(18250),
        enabled: true,
    });
    // Rejected documents
    lifecycleRules.push( {
        id: ResourceName.s3Buckets.LIFECYCLE_RULES.ARCHIVE_AND_REMOVE_REJECTED_DOCUMENTS,
        prefix: `*/${DocumentStatusFolderNames.REJECTED}/`,
        transitions: [
            {
                storageClass: StorageClass.GLACIER,
                /* 
                 * Transition to Glacier 7 days after rejection assuming re-upload or disputes 
                 * are resolved within a week 
                 */
                transitionAfter: Duration.days(7),
            },
        ],
        /* 
         * Removal after 6 months after rejection 
         * assuming enough time for re-upload, dispute processing and auditing to be completed 
         */
        expiration: Duration.days(180),
        enabled: true,
    });
    // Expired documents
    lifecycleRules.push( {
        id: ResourceName.s3Buckets.LIFECYCLE_RULES.ARCHIVE_AND_REMOVE_EXPIRED_DOCUMENTS,
        prefix: `*/${DocumentStatusFolderNames.EXPIRED}/`,
        transitions: [
            {
                storageClass: StorageClass.GLACIER,
                /* 
                 * Transition to Glacier 30 days after expiration 
                 * assuming re-newed documents were re-uploaded
                 */
                transitionAfter: Duration.days(30),
            },
        ],
         /* 
         * Delete after 730 days (2 years) or according to specific regulations
         */
        expiration: Duration.days(730),
        enabled: true,
    })
    const bucket = new Bucket(scope, ResourceName.s3Buckets.DOCUMENTS_BUCKET, {
        bucketName: ResourceName.s3Buckets.DOCUMENTS_BUCKET,
        encryption: BucketEncryption.S3_MANAGED,
        versioned: true,
        removalPolicy: isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
        autoDeleteObjects: !isProduction,
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        lifecycleRules: lifecycleRules
    });
    // Added listener for uploaded file to extract and save metadata + record audit event
    SupportedUploadFolders.forEach(folder => {
        documentS3UploadListenerLambda().addEventSource(new S3EventSource(bucket, {
            events: [EventType.OBJECT_CREATED],
            filters: [{ prefix: `${folder}` }]
        }));
    });

}