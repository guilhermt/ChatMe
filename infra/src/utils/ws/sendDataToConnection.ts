import { PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { client } from '../../clients/api-gateway';

export const sendDataToConnection = async (connId: string, data: Record<string, any>) => {
  const command = new PostToConnectionCommand({
    ConnectionId: connId,
    Data: JSON.stringify(data)
  });

  try {
    await client.send(command);
  } catch (e) {
    const statusCode = (e as any)?.$metadata?.httpStatusCode;

    if (statusCode === 410) {
      console.log(`Error - Stale connection: ${connId}`);
      return;
    }

    console.log(`Error sending data to Connection: ${connId}`, e);
  }
};
