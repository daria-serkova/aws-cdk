import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { ResourceName } from '../resource-reference';
import { isProduction } from '../../helpers/utilities';

let emailsTemplatesManagementGroupInstance: LogGroup | undefined;
/**
 * Function creates and configure CloudWatch group that only stores logs, related to the business process.
 */
 export function configurCloudWatchResources(scope: Construct) {
    /* Log Group where all business process related logs will be sent */
    const emailsTemplatesManagementGroup = new LogGroup(scope, 
        ResourceName.cloudWatch.TEMPLATES_MANAGEMENT_LOGS_GROUP, 
        {
            logGroupName: ResourceName.cloudWatch.TEMPLATES_MANAGEMENT_LOGS_GROUP,
            removalPolicy: isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
            retention: isProduction ? RetentionDays.SIX_MONTHS : RetentionDays.ONE_DAY,
        }
    );
}

export const emailsTemplatesManagementGroup = () => emailsTemplatesManagementGroupInstance;