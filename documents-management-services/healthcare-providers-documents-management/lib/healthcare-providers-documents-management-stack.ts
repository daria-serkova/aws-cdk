import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloudWatch from './cloud-watch';
import * as s3 from './s3';
import * as apiGateway from './api-gateway';
import configureDocumentsApiResources from './documents-api-endpoints';
export class HealthcareProvidersDocumentsManagementStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const logs = cloudWatch.configureResources(this);
    const documentsStorage = s3.configureResources(this);
    const api = apiGateway.configureResources(this);
    configureDocumentsApiResources(this, logs, api);
  }
}
