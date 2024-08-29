#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { GeoLocalizerSolutionStack } from '../lib/geo-localizer-solution-stack';
import environmentConfig from './stack-configs';

const app = new cdk.App();
new GeoLocalizerSolutionStack(app, 'GeoLocalizerSolutionStack', environmentConfig);