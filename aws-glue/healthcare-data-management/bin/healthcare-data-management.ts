#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { HealthcareDataManagementStack } from '../lib/healthcare-data-management-stack';
import environmentConfig from './stack-configs';

const app = new cdk.App();
new HealthcareDataManagementStack(app, 'HealthcareDataManagementStack', environmentConfig);