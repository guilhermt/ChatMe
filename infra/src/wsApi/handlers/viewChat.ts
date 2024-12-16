import { type APIGatewayProxyEvent } from 'aws-lambda';
import { httpResponse } from '../../utils/requests/httpResponse';
import { type Models } from '../../@types/models';
import { createUpdateObject } from '../../utils/dynamo/createUpdateObject';
import { updateDynamoItem } from '../../utils/dynamo/editItem';
import { getDynamoItem } from '../../utils/dynamo/getItem';

interface ViewChatEvent {
  action: 'viewChat',
  data: {
    chatId: string;
  }
}

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const body = JSON.parse(event.body ?? '{}') as ViewChatEvent;

    const { chatId } = body?.data ?? {};

    if (!chatId) {
      return httpResponse('Invalid Request', 404);
    }

    const connectionId = event.requestContext.connectionId!;

    const connectionKeys = {
      pk: 'connection',
      sk: `connection#${connectionId}`
    };

    const userConnection = await getDynamoItem<Models.Connection>(connectionKeys);

    if (!userConnection) {
      throw new Error('User Connection not found');
    }

    const { userId } = userConnection;

    const userChatKeys = {
      pk: `chat#${userId}`,
      sk: `chat#${chatId}`
    };

    const chatsUpdatedProps = {
      unreadMessages: 0
    } as Models.Chat;

    const userChatUpdate = createUpdateObject(chatsUpdatedProps);

    await updateDynamoItem(userChatKeys, userChatUpdate);

    return httpResponse({});
  } catch (e) {
    console.log(e);
    return httpResponse('Something went wrong', 500);
  }
};
