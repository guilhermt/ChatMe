import { type APIGatewayEvent } from 'aws-lambda';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { getDynamoItem } from '../dynamo/getItem';
import { httpResponse } from './httpResponse';
import { type Models } from '../../@types/models';
import { configEnv } from '../../config';

const clientId = configEnv.userPoolClientId;

const cognitoJwtVerifier = CognitoJwtVerifier.create({
  userPoolId: configEnv.userPoolId,
  tokenUse: 'access'
});

export const authorizer = async (event: APIGatewayEvent) => {
  try {
    const getToken = () => {
      const { authorization, Authorization } = event.headers;

      if (authorization) return authorization;

      if (Authorization) return Authorization;

      return event?.queryStringParameters?.token ?? '';
    };

    const auth = getToken();

    const token = auth.split(' ').at(-1) ?? '';

    const decodedJWT = await cognitoJwtVerifier.verify(token, {
      clientId
    });

    const userId = decodedJWT.username;

    const user = await getDynamoItem<Models.User>({
      pk: 'user',
      sk: `user#${userId}`
    });

    if (!user) {
      throw new Error('User not found');
    }

    return { user };
  } catch (e) {
    console.error('Error:', e);
    return httpResponse('Unauthorized', 401);
  }
};
