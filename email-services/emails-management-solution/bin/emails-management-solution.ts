#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EmailsManagementSolutionStack } from '../lib/emails-management-solution-stack';
import environmentConfig from './stack-configs';

const app = new cdk.App();
new EmailsManagementSolutionStack(app, 'EmailsManagementSolutionStack', environmentConfig);