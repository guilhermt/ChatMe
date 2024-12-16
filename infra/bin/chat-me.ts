#!/usr/bin/env node
import '../lib/utils/loadEnv';
import * as cdk from 'aws-cdk-lib';
import { ChatMeStack } from '../lib/chatme-stack';
import { getEnvName } from '../lib/utils/getEnvName';

const app = new cdk.App({});

new ChatMeStack(app, getEnvName('ChatMeStack'), {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});
