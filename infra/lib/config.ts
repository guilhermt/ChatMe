const isProd = process.env.ENVIRONMENT === 'prod';

export const configEnv = {
  env: process.env.ENVIRONMENT ?? '',
  certificateArn: process.env.CHATME_DOMAIN_CERTIFICATE_ARN ?? '',
  slackBotToken: process.env.SLACK_BOT_TOKEN ?? '',
  isProd,
  domainNames: {
    restApi: isProd ? 'chatme-api.guilhermedev.com' : 'chatme-api-dev.guilhermedev.com',
    wsApi: isProd ? 'chatme-wsapi.guilhermedev.com' : 'chatme-wsapi-dev.guilhermedev.com',
    webApp: isProd ? 'chatme.guilhermedev.com' : 'chatme-dev.guilhermedev.com'
  }
};
