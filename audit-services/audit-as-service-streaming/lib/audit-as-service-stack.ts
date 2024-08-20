import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import configureDataStreamingResources from './resources/data-streaming';
import configureS3Resources from './resources/s3';
import configureCloudWatchResources from './resources/cloud-watch';
import configureLambdaResources from './resources/lambdas';

/**
 * Defines an AWS CDK stack that sets up the necessary AWS resources for the Audit as a Service application.
 * 
 * The stack uses AWS CDK constructs to define and provision various resources including CloudWatch, Lambda functions, 
 * S3 buckets, and data streaming resources. The configuration of these resources is managed through separate modules
 * which are imported and utilized in the stack constructor. 
 */
export class AuditAsServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    configureCloudWatchResources(this);
    configureLambdaResources(this);
    configureS3Resources(this);
    configureDataStreamingResources(this);
  }
}