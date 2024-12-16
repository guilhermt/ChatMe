import { type APIGatewayProxyEvent } from 'aws-lambda';
import { httpResponse } from '../../utils/requests/httpResponse';
import { getAllDynamoItems } from '../../utils/dynamo/getAllItems';
import { type Models } from '../../@types/models';
import { sendDataToConnection } from '../../utils/ws/sendDataToConnection';

interface SendTypingChatEvent {
  action: 'typingChat',
  data: {
    chatId: string;
    contactId: string
    isTyping: string
  }
}

interface ReceivedTypingChatEvent {
  eventType: 'typing_chat';
  chatId: string;
  isTyping: string
}

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const body = JSON.parse(event.body ?? '{}') as SendTypingChatEvent;

    const { chatId, contactId, isTyping } = body?.data ?? {};

    if (!chatId || !contactId || typeof isTyping !== 'boolean') {
      return httpResponse('Invalid Request', 404);
    }

    const allConnections = await getAllDynamoItems<Models.Connection>({ keys: { pk: 'connection', sk: 'connection#' } });

    const contactConnection = allConnections.find(conn => conn.userId === contactId);

    if (!contactConnection) return httpResponse({});

    const typingEvent: ReceivedTypingChatEvent = {
      eventType: 'typing_chat',
      chatId,
      isTyping
    };

    await sendDataToConnection(contactConnection.id, typingEvent);

    return httpResponse({});
  } catch (e) {
    console.log(e);
    return httpResponse('Something went wrong', 500);
  }
};
