import { SQSClient } from '@aws-sdk/client-sqs';

export const client = new SQSClient({
  region: process.env.CDK_DEFAULT_REGION
});
