import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import configureCloudWatchResources from './resources/cloud-watch';
import configureLambdaResources from './resources/lambdas';
import configureApiGatewayResources from './resources/api-gateway';
import configureDynamoDbResources from './resources/dynamo-db';
export class GeoLocalizerSolutionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const logGroup: LogGroup = configureCloudWatchResources(this);
    configureDynamoDbResources(this);
    configureLambdaResources(this, logGroup);
    configureApiGatewayResources(this);  
  }
}
