#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ChatMeStack } from '../lib/chatme-stack';
import { config } from 'dotenv';
import { getEnvName } from '../lib/utils/getEnvName';

const env = process.env.NODE_ENV ?? '';

const envPath = env === 'prod' ? './.env.prod' : './.env.dev';

config({
  path: envPath
});

const app = new cdk.App({});

new ChatMeStack(app, getEnvName('ChatMeStack'), {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});
