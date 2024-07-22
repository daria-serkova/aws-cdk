#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ComplianceAndAuditingStack } from '../lib/compliance-and-auditing-stack';
import environmentConfig from './stack-configs';

const app = new cdk.App();
new ComplianceAndAuditingStack(app, 'ComplianceAndAuditingStack', environmentConfig);