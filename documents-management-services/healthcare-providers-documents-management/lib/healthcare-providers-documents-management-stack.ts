import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloudWatch from './cloud-watch';
import * as s3 from './s3';
import { configureDatabases } from './databases';
import { configureLambdas } from './lambdas';
import { configureUploadDocumentsWorkflowStateMachine } from './state-machines';
import { configureApiGateway } from './api-gateway';
export class HealthcareProvidersDocumentsManagementStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const logs = cloudWatch.configureResources(this);
    s3.configureResources(this);
    configureDatabases(this);
    configureLambdas(this, '../functions');
    configureUploadDocumentsWorkflowStateMachine(this);
    configureApiGateway(this);
  }
}
