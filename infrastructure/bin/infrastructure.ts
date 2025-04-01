#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CorreoMicroserviciosStack } from '../lib/aws-cdk';

const app = new cdk.App();
new CorreoMicroserviciosStack(app, 'CorreoMicroserviciosStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
}); 