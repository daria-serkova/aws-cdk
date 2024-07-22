import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloudWatch from './cloud-watch';
import * as s3 from './s3';
import { awsResourcesNamingConvention } from '../helpers/utilities';

/**
 * AWS Resources names
 */
const resourcesNames = {
  logGroup: awsResourcesNamingConvention.replace('$', 'log-group'),
  s3: awsResourcesNamingConvention.replace('$', 'bucket').toLowerCase(),
}
export class HealthcareDataManagementStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const logs = cloudWatch.configureResources(this, resourcesNames.logGroup);
    const bucket = s3.configureResources(this, resourcesNames.s3);

   
    // Add IAM
    // Upload syntetic data
    // Add Glue Catalog
    // Add Glue Table
    // Add Glue Crawler
    // Add Glue Job
    // Configure Glue trigger
  }
}