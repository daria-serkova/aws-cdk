import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import configureCloudWatchResources from './resources/cloud-watch';
import configureApiGatewayResources from './resources/api-gateway';
import configureLambdaResources from './resources/lambdas';

export class AuditAsServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    //configureCloudWatchResources(this);
    configureLambdaResources(this);
    configureApiGatewayResources(this);
  }
}
