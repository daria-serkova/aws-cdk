import { Construct } from "constructs";
import { LogGroup, LogStream, RetentionDays } from "aws-cdk-lib/aws-logs";
import { RemovalPolicy } from "aws-cdk-lib";
import { isProduction } from "../../helpers/utils";
import { ResourceName } from "../resource-reference";

let firehoseDataStreamLogGroupInstance: LogGroup;
export const firehoseDataStreamLogGroup = () => firehoseDataStreamLogGroupInstance;
/**
 * Function creates and configure CloudWatch resources
 */
 export default function configureCloudWatchResources(scope: Construct) {
    const name = ResourceName.cloudWatch.KINESIS_AUDIT_EVENTS_FIREHOSE_STREAM_LG;
    firehoseDataStreamLogGroupInstance = new LogGroup(scope, name, {
        logGroupName:name,
        removalPolicy: isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
        retention: isProduction ? RetentionDays.SIX_MONTHS : RetentionDays.ONE_DAY,
    });

    // Create a Log Stream within the Log Group
    const logStreamName = ResourceName.cloudWatch.KINESIS_AUDIT_EVENTS_FIREHOSE_STREAM_LS;
    const firehoseDataStreamLogStream = new LogStream(scope, logStreamName, {
        logGroup: firehoseDataStreamLogGroupInstance,
        logStreamName: logStreamName,
    });
}