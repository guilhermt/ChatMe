import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

export const client = new DynamoDBClient({
  region: process.env.CDK_DEFAULT_REGION
});
