import { type APIGatewayEvent } from 'aws-lambda';
import { authorizer } from '../../../utils/requests/authorizer';
import { httpResponse } from '../../../utils/requests/httpResponse';
import { parsePaginatedQueryParams } from '../../../utils/requests/parseQueryParams';
import { getPaginatedItemsValidation } from '../../validation/common';
import { getPaginatedDynamoItems } from '../../../utils/dynamo/getPaginatedItems';
import { type Models } from '../../../@types/models';
import { getDynamoItem } from '../../../utils/dynamo/getItem';

export const handler = async (event: APIGatewayEvent) => {
  try {
    const authResponse = await authorizer(event);

    if (!('user' in authResponse)) {
      return authResponse;
    }

    const { user } = authResponse;

    const paginationParams = parsePaginatedQueryParams(event);

    const validation = getPaginatedItemsValidation(paginationParams);

    if (typeof validation === 'string') {
      return httpResponse(validation, 400);
    }

    const { pageSize, search, lastKey } = validation;

    const chatsKeys = {
      pk: `chat#${user.id}`
    };

    const filter = {
      expression: 'contains(#nameAttr, :nameSearchValue)',
      attributeNames: {
        '#nameAttr': 'contactSearchName'
      },
      attributeValues: {
        nameSearchValue: search?.toLowerCase()
      }
    };

    const { items: chats, lastEvaluetedKey } = await getPaginatedDynamoItems<Models.Chat>({
      keys: chatsKeys,
      pageSize,
      lastKey,
      filter: search ? filter : undefined,
      inverse: true,
      gsi: true
    });

    const extendChatData = async (chat: Models.Chat) => {
      const contactUser = await getDynamoItem<Models.User>({
        pk: 'user',
        sk: `user#${chat.contactId}`
      });

      const { name, profilePicture, lastSeen } = contactUser!;

      const extendedChat: Models.ExtendedChat = {
        ...chat,
        contact: {
          name,
          profilePicture,
          lastSeen
        }
      };

      return extendedChat;
    };

    const extendedChatsPromises = chats.map(extendChatData);

    const extendedChats = await Promise.all(extendedChatsPromises);

    return httpResponse({ chats: extendedChats, lastEvaluetedKey });
  } catch (e) {
    console.log(e);
    return httpResponse('Something went wrong.', 500);
  }
};
