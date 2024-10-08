import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import configureCloudWatchResources from './resources/cloud-watch';
import configureS3Resources from './resources/s3';
import configureLambdaResources from './resources/lambdas';
import configureApiGatewayResources from './resources/api-gateway';
import configureDynamoDbResources from './resources/dynamo-db';
import configureStateMachines from './resources/state-machines';
export class DocumentsManagementSolutionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const logGroups: { 
      documentOperations: LogGroup,
      documentWorkflow: LogGroup,
    } = configureCloudWatchResources(this);
    configureLambdaResources(this, logGroups);
    configureS3Resources(this);
    configureDynamoDbResources(this);
    configureStateMachines(this, logGroups.documentWorkflow);
    configureApiGatewayResources(this);
  }
}
