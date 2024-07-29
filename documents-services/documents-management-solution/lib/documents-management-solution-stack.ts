import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { configureCloudWatchResources } from './resources/cloud-watch';
import { LogGroup } from 'aws-cdk-lib/aws-logs';

export class DocumentsManagementSolutionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const logGroups: { 
      documentOperations: LogGroup,
      documentWorkflow: LogGroup,
      documentNotifications: LogGroup,
      documentAdministration: LogGroup
    } = configureCloudWatchResources(this)
  }
}