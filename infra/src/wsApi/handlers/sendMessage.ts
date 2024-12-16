import { type APIGatewayProxyEvent } from 'aws-lambda';
import { httpResponse } from '../../utils/requests/httpResponse';
import { getAllDynamoItems } from '../../utils/dynamo/getAllItems';
import { type Models } from '../../@types/models';
import { sendDataToConnection } from '../../utils/ws/sendDataToConnection';
import { v4 } from 'uuid';
import { createDynamoItem } from '../../utils/dynamo/createItem';
import { createUpdateObject } from '../../utils/dynamo/createUpdateObject';
import { updateDynamoItem } from '../../utils/dynamo/editItem';
import { getDynamoItem } from '../../utils/dynamo/getItem';
import { DataType } from '../../@types/enums';

interface SendMessageEvent {
  action: 'sendMessage',
  data: {
    message: Models.Message['content']
    chatId: string;
    contactId: string
  }
}

interface ReceivedMessageEvent {
  eventType: 'received_message';
  message: Models.Message;
  contactId: string;
  chatId: string
}

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const body = JSON.parse(event.body ?? '{}') as SendMessageEvent;

    const { message, chatId, contactId } = body?.data ?? {};

    if (!message?.data || !chatId || !contactId) {
      return httpResponse('Invalid Request', 404);
    }

    const connectionId = event.requestContext.connectionId!;

    const allConnections = await getAllDynamoItems<Models.Connection>({ keys: { pk: 'connection', sk: 'connection#' } });

    const userConnection = allConnections.find(conn => conn.id === connectionId);

    if (!userConnection) {
      throw new Error('User Connection not found');
    }

    const { userId } = userConnection;

    const messageId = v4();

    const now = Date.now();

    const messageItem: Models.Message = {
      pk: `chat#${chatId}`,
      sk: `message#${messageId}`,
      id: messageId,
      dataType: DataType.MESSAGE,
      createdAt: now,
      updatedAt: now,
      gsi: now,
      chatId,
      senderId: userId,
      receiverId: contactId,
      content: message
    };

    const userChatKeys = {
      pk: `chat#${userId}`,
      sk: `chat#${chatId}`
    };

    const contactChatKeys = {
      pk: `chat#${contactId}`,
      sk: `chat#${chatId}`
    };

    const contactChat = await getDynamoItem<Models.Chat>(contactChatKeys);

    const chatsUpdatedProps = {
      updatedAt: now,
      gsi: now,
      lastMessage: message.data
    } as Models.Chat;

    const contactChatUpdateProps = {
      ...chatsUpdatedProps,
      unreadMessages: contactChat!.unreadMessages + 1
    } as Models.Chat;

    const userChatUpdate = createUpdateObject(chatsUpdatedProps);

    const contactChatUpdate = createUpdateObject(contactChatUpdateProps);

    const contactConnection = allConnections.find(conn => conn.userId === contactId);

    const messageEvent: ReceivedMessageEvent = {
      eventType: 'received_message',
      message: messageItem,
      contactId: userId,
      chatId
    };

    const sendMessageToReceiver = async () => {
      if (!contactConnection) return;

      await sendDataToConnection(contactConnection.id, messageEvent);
    };

    await Promise.all([
      createDynamoItem(messageItem),
      sendMessageToReceiver(),
      updateDynamoItem(userChatKeys, userChatUpdate),
      updateDynamoItem(contactChatKeys, contactChatUpdate)
    ]);

    return httpResponse({});
  } catch (e) {
    console.log(e);
    return httpResponse('Something went wrong', 500);
  }
};
