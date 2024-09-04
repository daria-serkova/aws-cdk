import { Construct } from "constructs";
import * as firehose from 'aws-cdk-lib/aws-kinesisfirehose';
import { ResourceName } from "../resource-reference";
import { 
  addCloudWatchPutPolicy, 
  addLambdaInvokePolicy, 
  addS3WritePolicy, 
  createKinesisFirehoseRole 
} from "./iam";

export default function configureDataStreamingResources(scope: Construct) {
  const iamRole = createKinesisFirehoseRole(scope, ResourceName.iam.KINESIS_AUDIT_EVENTS_FIREHOSE_STREAM);
  addS3WritePolicy(iamRole, ResourceName.s3.AUDIT_EVENTS_STORAGE);
  addCloudWatchPutPolicy(iamRole, ResourceName.cloudWatch.KINESIS_AUDIT_EVENTS_FIREHOSE_STREAM_LG);
  addLambdaInvokePolicy(iamRole, ResourceName.lambda.DATA_STREAM_TRANSFORMATION_LAMBDA);

  const cloudWatchLoggingOptions: firehose.CfnDeliveryStream.CloudWatchLoggingOptionsProperty = {
    enabled: true,
    logGroupName: ResourceName.cloudWatch.KINESIS_AUDIT_EVENTS_FIREHOSE_STREAM_LG,
    logStreamName: ResourceName.cloudWatch.KINESIS_AUDIT_EVENTS_FIREHOSE_STREAM_LS
};
  const stream = new firehose.CfnDeliveryStream(scope, 
    ResourceName.streaming.KINESIS_AUDIT_EVENTS_FIREHOSE_STREAM, {
    deliveryStreamName: ResourceName.streaming.KINESIS_AUDIT_EVENTS_FIREHOSE_STREAM,
    extendedS3DestinationConfiguration: {
      bucketArn: `arn:aws:s3:::${ResourceName.s3.AUDIT_EVENTS_STORAGE}`,
      roleArn: iamRole.roleArn,
      compressionFormat: 'UNCOMPRESSED',
      bufferingHints: {
        intervalInSeconds: 60, // Ensure data is delivered every 60 seconds
        sizeInMBs: 64           // Minimum required for dynamic partition
      },
      cloudWatchLoggingOptions: cloudWatchLoggingOptions,
      processingConfiguration: {
        enabled: true,
        processors: [
          {
            type: 'Lambda',
            parameters: [
              {
                parameterName: 'LambdaArn',
                parameterValue: `arn:aws:lambda:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT}:function:${ResourceName.lambda.DATA_STREAM_TRANSFORMATION_LAMBDA}`,
              },
            ],
          },
        ],
      },
      prefix: "!{partitionKeyFromLambda:initiatorsystemcode}/!{partitionKeyFromLambda:eventtype}/!{partitionKeyFromLambda:year}/!{partitionKeyFromLambda:month}/!{partitionKeyFromLambda:day}/",
       // Specify the ErrorOutputPrefix
  errorOutputPrefix: "errors/!{firehose:error-output-type}/!{timestamp:yyyy/MM/dd/HH}/",

      dynamicPartitioningConfiguration: {
        enabled: true,
        retryOptions: {
          durationInSeconds: 300,
        },
      },
    },
    
    
  });
}