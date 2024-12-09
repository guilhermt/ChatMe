import { type SQSEvent } from 'aws-lambda';
import { httpResponse } from '../../utils/requests/httpResponse';
import { getAllDynamoItems } from '../../utils/dynamo/getAllItems';
import { type Models } from '../../@types/models';
import { sendDataToConnection } from '../../utils/ws/sendDataToConnection';

interface OnlineUsersEvent {
  eventType: 'online_users'
  onlineUsers: string[]
}

export const handler = async (event: SQSEvent) => {
  try {
    console.log(`Handing ${event.Records.length} event(s) from SQS`);

    const connectionItems = await getAllDynamoItems<Models.Connection>({ keys: { pk: 'connection' } });

    const onlineUsers = connectionItems.map(conn => conn.userId);
    const activeConnections = connectionItems.map(conn => conn.id);

    const sendUsersPromises = activeConnections.map(async (connId: string) => {
      const onlineUsersEvent: OnlineUsersEvent = {
        eventType: 'online_users',
        onlineUsers
      };

      await sendDataToConnection(connId, onlineUsersEvent);
    });

    await Promise.all(sendUsersPromises);

    return httpResponse({});
  } catch (e) {
    console.log(e);
    return httpResponse('Something went wrong', 500);
  }
};
