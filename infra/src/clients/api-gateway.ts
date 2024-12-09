import { ApiGatewayManagementApiClient } from '@aws-sdk/client-apigatewaymanagementapi';

export const client = new ApiGatewayManagementApiClient({
  endpoint: `https://hez9w87b89.execute-api.us-east-1.amazonaws.com/${process.env.ENVIRONMENT}`
});
