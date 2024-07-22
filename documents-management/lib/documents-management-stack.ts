import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloudWatch from './cloud-watch';
import * as s3 from './s3';
import * as api from './api-gateway';
export class DocumentsManagementStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const logs = cloudWatch.configureResources(this);
    const bucket = s3.configureResources(this);
    const apiGateway = api.configureResources(this);
  }
}
