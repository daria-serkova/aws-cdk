import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class ComplianceAndAuditingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
  }
  // Add Logs Management
  // Add IAM
  // Add S3 bucket structure
  // Upload syntetic data
  // Add Glue Catalog
  // Add Glue Table
  // Add Glue Crawler
}
