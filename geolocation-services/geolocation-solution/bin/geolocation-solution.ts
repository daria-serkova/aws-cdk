#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { GeoLocationSolutionStack } from '../lib/geolocation-solution-stack';
import environmentConfig from './stack-configs';

const app = new cdk.App();
new GeoLocationSolutionStack(app, 'GeoLocationSolutionStack', environmentConfig);