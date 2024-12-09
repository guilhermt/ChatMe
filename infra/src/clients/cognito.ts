import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

export const client = new CognitoIdentityProviderClient({
  region: process.env.CDK_DEFAULT_REGION
});
