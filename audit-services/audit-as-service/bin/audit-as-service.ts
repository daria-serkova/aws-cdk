#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AuditAsServiceStack } from '../lib/audit-as-service-stack';
import environmentConfig from './stack-configs';

const app = new cdk.App();
new AuditAsServiceStack(app, 'AuditAsServiceStack', environmentConfig);