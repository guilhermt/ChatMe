import { type APIGatewayEvent } from 'aws-lambda';
import { httpResponse } from '../../../utils/requests/httpResponse';
import { type Models } from '../../../@types/models';
import { createDynamoItem } from '../../../utils/dynamo/createItem';
import { authorizer } from '../../../utils/requests/authorizer';
import { getDynamoItem } from '../../../utils/dynamo/getItem';
import { v4 } from 'uuid';
import { getAllDynamoItems } from '../../../utils/dynamo/getAllItems';
import { DataType } from '../../../@types/enums';
import { sendDataToConnection } from '../../../utils/ws/sendDataToConnection';

interface ReceivedNewChatEvent {
  eventType: 'received_new_chat';
  chat: Models.ExtendedChat
}

export const handler = async (event: APIGatewayEvent) => {
  try {
    const authResponse = await authorizer(event);

    if (!('user' in authResponse)) {
      return authResponse;
    }

    const { user } = authResponse;

    const body = JSON.parse(event.body ?? '{}') as Record<string, any>;

    const contactId = body?.userId as string | undefined;

    if (!contactId) {
      return httpResponse('User Id is required', 400);
    }

    const receiverUser = await getDynamoItem<Models.User>({
      pk: 'user',
      sk: `user#${contactId}`
    });

    if (!receiverUser) {
      throw new Error('Contact not found');
    }

    const { name, profilePicture, lastSeen } = receiverUser;

    const allUserChats = await getAllDynamoItems<Models.Chat>({ keys: { pk: `chat#${user.id}`, sk: 'chat#' } });

    const existingChat = allUserChats.find(chat => chat.contactId === contactId);

    if (existingChat) {
      const existingChatExtended: Models.ExtendedChat = {
        ...existingChat,
        contact: {
          name,
          profilePicture,
          lastSeen
        }
      };

      return httpResponse({ chat: existingChatExtended });
    }

    const chatId = v4();

    const now = Date.now();

    const senderChat: Models.Chat = {
      pk: `chat#${user.id}`,
      sk: `chat#${chatId}`,
      id: chatId,
      dataType: DataType.CHAT,
      createdAt: now,
      updatedAt: now,
      gsi: now,
      startedBy: user.id,
      contactId,
      contactSearchName: receiverUser.searchName,
      lastMessage: '',
      unreadMessages: 0
    };

    const receiverChat: Models.Chat = {
      pk: `chat#${receiverUser.id}`,
      sk: `chat#${chatId}`,
      id: chatId,
      dataType: DataType.CHAT,
      createdAt: now,
      updatedAt: now,
      gsi: now,
      startedBy: user.id,
      contactId: user.id,
      contactSearchName: user.searchName,
      lastMessage: '',
      unreadMessages: 0
    };

    const extendedChat: Models.ExtendedChat = {
      ...senderChat,
      contact: {
        name,
        profilePicture,
        lastSeen
      }
    };

    const sendChatToContact = async () => {
      const allConnections = await getAllDynamoItems<Models.Connection>({ keys: { pk: 'connection' } });

      const receiverConnection = allConnections.find(conn => conn.userId === contactId);

      if (!receiverConnection) return;

      const extendedReceiverChat: Models.ExtendedChat = {
        ...receiverChat,
        contact: {
          name: user.name,
          profilePicture: user.profilePicture,
          lastSeen: user.lastSeen
        }
      };

      const receivedNewChatEvent: ReceivedNewChatEvent = {
        eventType: 'received_new_chat',
        chat: extendedReceiverChat
      };

      await sendDataToConnection(receiverConnection.id, receivedNewChatEvent);
    };

    await Promise.all([
      createDynamoItem(senderChat),
      createDynamoItem(receiverChat),
      sendChatToContact()
    ]);

    return httpResponse({ chat: extendedChat });
  } catch (e) {
    console.log(e);
    return httpResponse('Something went wrong', 500);
  }
};
