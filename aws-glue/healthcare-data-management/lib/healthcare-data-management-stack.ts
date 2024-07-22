import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloudWatch from './cloud-watch';
import { awsResourcesNamingConvention } from '../helpers/utilities';

/**
 * AWS Resources names
 */
const resourcesNames = {
  logsSettings: awsResourcesNamingConvention.replace('$', 'glue-app-healthcare-data-management'),
}
export class HealthcareDataManagementStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const logs = cloudWatch.configureResources(this, resourcesNames.logsSettings);

   
    // Add IAM
    // Add S3 bucket structure
    // Upload syntetic data
    // Add Glue Catalog
    // Add Glue Table
    // Add Glue Crawler
    // Add Glue Job
    // Configure Glue trigger
  }
}