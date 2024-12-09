import { type APIGatewayEvent } from 'aws-lambda';
import { authorizer } from '../../../utils/requests/authorizer';
import { httpResponse } from '../../../utils/requests/httpResponse';
import { parsePaginatedQueryParams } from '../../../utils/requests/parseQueryParams';
import { getPaginatedItemsValidation } from '../../validation/common';
import { getPaginatedDynamoItems } from '../../../utils/dynamo/getPaginatedItems';
import { type Models } from '../../../@types/models';

export const handler = async (event: APIGatewayEvent) => {
  try {
    const authResponse = await authorizer(event);

    if (!('user' in authResponse)) {
      return authResponse;
    }

    const paginationParams = parsePaginatedQueryParams(event);

    const validation = getPaginatedItemsValidation(paginationParams);

    if (typeof validation === 'string') {
      return httpResponse(validation, 400);
    }

    const chatId = event.pathParameters?.chatId;

    if (!chatId) {
      return httpResponse('Chat Id is required', 400);
    }

    const { pageSize, lastKey } = validation;

    const messageKeys = {
      pk: `chat#${chatId}`
    };

    const { items: messages, lastEvaluetedKey } = await getPaginatedDynamoItems<Models.Message>({
      keys: messageKeys,
      pageSize,
      lastKey,
      inverse: true,
      gsi: true
    });

    const sortedMessages = messages.reverse();

    return httpResponse({ messages: sortedMessages, lastEvaluetedKey });
  } catch (e) {
    console.log(e);
    return httpResponse('Something went wrong.', 500);
  }
};
