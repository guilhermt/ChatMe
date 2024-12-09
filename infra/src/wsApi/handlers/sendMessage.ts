import { type APIGatewayProxyEvent } from 'aws-lambda';
import { httpResponse } from '../../utils/requests/httpResponse';
import { getAllDynamoItems } from '../../utils/dynamo/getAllItems';
import { type Models } from '../../@types/models';
import { sendDataToConnection } from '../../utils/ws/sendDataToConnection';
import { v4 } from 'uuid';
import { createDynamoItem } from '../../utils/dynamo/createItem';

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
}

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const body = JSON.parse(event.body ?? '{}') as SendMessageEvent;

    const { message, chatId, contactId } = body?.data ?? {};

    if (!message?.data || !contactId) {
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
      createdAt: now,
      updatedAt: now,
      gsi: now,
      chatId,
      senderId: userId,
      receiverId: contactId,
      content: message
    };

    const contactConnection = allConnections.find(conn => conn.userId === contactId);

    const messageEvent: ReceivedMessageEvent = {
      eventType: 'received_message',
      message: messageItem,
      contactId: userId
    };

    const sendMessageToReceiver = async () => {
      if (!contactConnection) return;

      await sendDataToConnection(contactConnection.id, messageEvent);
    };

    await Promise.all([
      createDynamoItem(messageItem),
      sendMessageToReceiver()
    ]);

    return httpResponse({});
  } catch (e) {
    console.log(e);
    return httpResponse('Something went wrong', 500);
  }
};
