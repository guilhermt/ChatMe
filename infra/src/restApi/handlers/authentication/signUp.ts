import { type APIGatewayEvent } from 'aws-lambda';
import { signUpValidation } from '../../validation/auth/signUp';
import { httpResponse } from '../../../utils/requests/httpResponse';
import { createCognitoAccount } from '../../../utils/cognito/signUp';
import { type Models } from '../../../@types/models';
import { createDynamoItem } from '../../../utils/dynamo/createItem';
import { sendNewUserNotification } from '../../../utils/slack/newUserNotification';

export const handler = async (event: APIGatewayEvent) => {
  try {
    const body = JSON.parse(event.body ?? '{}') as Record<string, any>;

    const validation = signUpValidation(body);

    if (typeof validation === 'string') {
      return httpResponse(validation, 400);
    }

    const { name, email, password } = validation;

    const userId = await createCognitoAccount({ email, password });

    const now = Date.now();

    const user: Models.User = {
      pk: 'user',
      sk: `user#${userId}`,
      id: userId,
      createdAt: now,
      updatedAt: now,
      lastSeen: now,
      gsi: now,
      name,
      searchName: name.toLowerCase(),
      email,
      profilePicture: null
    };

    await Promise.all([
      createDynamoItem(user),
      sendNewUserNotification({ name, email })
    ]);

    return httpResponse({});
  } catch (e) {
    console.log(e);
    return httpResponse('Something went wrong', 500);
  }
};
