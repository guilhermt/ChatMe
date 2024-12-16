import { ApiGatewayManagementApiClient } from '@aws-sdk/client-apigatewaymanagementapi';
import { configEnv } from '../../lib/config';

const domainName = configEnv.isProd ? 'chatme-wsapi.guilhermedev.com' : 'chatme-wsapi-dev.guilhermedev.com';

export const client = new ApiGatewayManagementApiClient({
  endpoint: `https://${domainName}`
});
