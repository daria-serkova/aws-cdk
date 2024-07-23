import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { IS_PRODUCTION } from '../helpers/utilities';
/**
 * Pattern for Log Group ARN string to pass it to IAM policies.
 */
const arnLogsPattern = `arn:aws:logs:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT}:log-group:$:*`;
/**
 * Function creates and configure CloudWatch group that only stores logs, related to the business process.
 * @param scope 
 * @param groupName 
 * @returns cloudWatchLogGroup and iamPolicyAllowCreateCloudWatchLogsInGroup that can be attached to other resources in stack
 */
export function configureResources(scope: Construct, groupName: string) {
    /* Log Group where all business process related logs will be sent */
    const cloudWatchLogGroup = new LogGroup(scope, groupName, {
      logGroupName: groupName,
      removalPolicy: IS_PRODUCTION ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      retention: IS_PRODUCTION ? RetentionDays.SIX_MONTHS : RetentionDays.ONE_DAY,
    });
    /* IAM Policy, that allows AWS resources to create logs in specified log group */
    const iamPolicyAllowCreateCloudWatchLogsInGroup = new PolicyStatement({
        actions: [
            'logs:CreateLogGroup',
            'logs:CreateLogStream',
            'logs:PutLogEvents',
        ],
        resources: [`${arnLogsPattern.replace('$', groupName)}`],
    });
    return {
        group: cloudWatchLogGroup,
        policy: iamPolicyAllowCreateCloudWatchLogsInGroup
    }
}