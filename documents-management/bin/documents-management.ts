#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DocumentsManagementStack } from '../lib/documents-management-stack';
import environmentConfig from './stack-configs';

const app = new cdk.App();
new DocumentsManagementStack(app, 'DocumentsManagementStack', environmentConfig);