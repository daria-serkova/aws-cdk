import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { ResourceName } from '../resource-reference';
import { isProduction } from '../../helpers/utilities';

/**
 * Function creates and configure CloudWatch group that only stores logs, related to the business process.
 */
 export default function configureCloudWatchResources(scope: Construct) {
    return new LogGroup(scope, ResourceName.cloudWatch.LOGS_GROUP, {
        logGroupName: ResourceName.cloudWatch.LOGS_GROUP,
        removalPolicy: isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
        retention: isProduction ? RetentionDays.SIX_MONTHS : RetentionDays.ONE_DAY,
    });
}