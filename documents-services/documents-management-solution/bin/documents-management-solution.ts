#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DocumentsManagementSolutionStack } from '../lib/documents-management-solution-stack';
import environmentConfig from './stack-configs';

const app = new cdk.App();
new DocumentsManagementSolutionStack(app, 'DocumentsManagementSolutionStack', environmentConfig);