#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { HealthcareProvidersDocumentsManagementStack } from '../lib/healthcare-providers-documents-management-stack';
import environmentConfig from './stack-configs';

const app = new cdk.App();
new HealthcareProvidersDocumentsManagementStack(app, 'HealthcareProvidersDocumentsManagementStack', environmentConfig);