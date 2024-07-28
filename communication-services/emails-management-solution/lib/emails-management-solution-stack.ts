import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import configureDynamoDbResources from './resources/dynamo-db';
import { configureS3Resources } from './resources/s3';
import { configureApiGatewayResources } from './resources/api-gateway';
import { configureLambdaResources } from './resources/lambdas';
import { configureCloudWatchResources } from './resources/cloud-watch';

export class EmailsManagementSolutionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const logGroups = configureCloudWatchResources(this)
    configureDynamoDbResources(this);
    configureS3Resources(this);
    configureLambdaResources(this, logGroups);
    configureApiGatewayResources(this);
  }
}
