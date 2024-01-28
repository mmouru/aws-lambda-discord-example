#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CakeAlertStack } from '../lib/cdk-stack';
require('dotenv').config();

const app = new cdk.App();
  new CakeAlertStack(app, 'CdkStack', { env: { account: process.env.ACCOUNT, region: "eu-north-1"}
});