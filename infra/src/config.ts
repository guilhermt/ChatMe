export const configEnv = {
  env: process.env.ENVIRONMENT ?? '',
  userPoolId: process.env.USERPOOL_ID ?? '',
  userPoolClientId: process.env.USERPOOL_CLIENT_ID ?? '',
  tableName: process.env.TABLE_NAME ?? '',
  bucketName: process.env.BUCKET_NAME ?? '',
  slackToken: process.env.SLACK_BOT_TOKEN ?? '',
  queueUrl: process.env.QUEUE_URL ?? ''
};
