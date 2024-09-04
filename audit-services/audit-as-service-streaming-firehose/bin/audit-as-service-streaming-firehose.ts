#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AuditAsServiceStreamingFirehoseStack } from '../lib/audit-as-service-streaming-firehose-stack';
import environmentConfig from './stack-configs';

const app = new cdk.App();
new AuditAsServiceStreamingFirehoseStack(app, 'AuditAsServiceStreamingFirehoseStack', environmentConfig);