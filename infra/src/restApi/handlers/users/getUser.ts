import { type APIGatewayEvent } from 'aws-lambda';
import { authorizer } from '../../../utils/requests/authorizer';
import { httpResponse } from '../../../utils/requests/httpResponse';

export const handler = async (event: APIGatewayEvent) => {
  try {
    const authResponse = await authorizer(event);

    if (!('user' in authResponse)) {
      return authResponse;
    }

    const { id, name, email, profilePicture } = authResponse.user;

    return httpResponse({ id, name, email, profilePicture });
  } catch (e) {
    console.log(e);
    return httpResponse('Something went wrong.', 500);
  }
};
