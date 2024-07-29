import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { ResourceName } from '../resource-reference';
import { isProduction } from '../../helpers/utilities';

/**
 * Function creates and configure CloudWatch group that only stores logs, related to the business process.
 */
 export function configureCloudWatchResources(scope: Construct) {
    const documentOperations = new LogGroup(scope, ResourceName.cloudWatch.DOCUMENT_OPERATIONS_LOGS_GROUP, {
        logGroupName: ResourceName.cloudWatch.DOCUMENT_OPERATIONS_LOGS_GROUP,
        removalPolicy: isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
        retention: isProduction ? RetentionDays.SIX_MONTHS : RetentionDays.ONE_DAY,
    });
    const documentWorkflow = new LogGroup(scope, ResourceName.cloudWatch.DOCUMENT_WORKFLOW_LOGS_GROUP, {
        logGroupName: ResourceName.cloudWatch.DOCUMENT_WORKFLOW_LOGS_GROUP,
        removalPolicy: isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
        retention: isProduction ? RetentionDays.SIX_MONTHS : RetentionDays.ONE_DAY,
    });
    const documentNotifications = new LogGroup(scope, ResourceName.cloudWatch.DOCMENT_NOTIFICATIONS_LOGS_GROUP, {
        logGroupName: ResourceName.cloudWatch.DOCMENT_NOTIFICATIONS_LOGS_GROUP,
        removalPolicy: isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
        retention: isProduction ? RetentionDays.SIX_MONTHS : RetentionDays.ONE_DAY,
    });
    const documentAdministration = new LogGroup(scope, ResourceName.cloudWatch.DOCUMENT_ADMINISTRATION_LOGS_GROUP, {
        logGroupName: ResourceName.cloudWatch.DOCUMENT_ADMINISTRATION_LOGS_GROUP,
        removalPolicy: isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
        retention: isProduction ? RetentionDays.SIX_MONTHS : RetentionDays.ONE_DAY,
    });
    return {
        documentOperations,
        documentWorkflow,
        documentNotifications,
        documentAdministration
    }
}