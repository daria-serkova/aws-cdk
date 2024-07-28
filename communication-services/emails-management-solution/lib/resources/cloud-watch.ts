import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { ResourceName } from '../resource-reference';
import { isProduction } from '../../helpers/utilities';

/**
 * Function creates and configure CloudWatch group that only stores logs, related to the business process.
 */
 export function configureCloudWatchResources(scope: Construct) {
    const templatesManagementLogsGroup = new LogGroup(scope, ResourceName.cloudWatch.TEMPLATES_MANAGEMENT_LOGS_GROUP, {
        logGroupName: ResourceName.cloudWatch.TEMPLATES_MANAGEMENT_LOGS_GROUP,
        removalPolicy: isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
        retention: isProduction ? RetentionDays.SIX_MONTHS : RetentionDays.ONE_DAY,
    });
    const deliveryLogsGroup = new LogGroup(scope, ResourceName.cloudWatch.DELIVERY_LOGS_GROUP, {
        logGroupName: ResourceName.cloudWatch.DELIVERY_LOGS_GROUP,
        removalPolicy: isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
        retention: isProduction ? RetentionDays.SIX_MONTHS : RetentionDays.ONE_DAY,
    });
    const reportsLogsGroup = new LogGroup(scope, ResourceName.cloudWatch.REPORTS_LOGS_GROUP, {
        logGroupName: ResourceName.cloudWatch.REPORTS_LOGS_GROUP,
        removalPolicy: isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
        retention: isProduction ? RetentionDays.SIX_MONTHS : RetentionDays.ONE_DAY,
    });
    return {
        templatesManagementLogsGroup,
        deliveryLogsGroup,
        reportsLogsGroup
    }
}