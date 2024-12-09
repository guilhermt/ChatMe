import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { client } from '../../clients/sqs';

const QUEUE_URL = process.env.QUEUE_URL!;

export interface SQSSourceEvent {
  type: 'connect' | 'disconnect',
  connectionId: string;
  userId: string
}

export const sendSQSMessage = async (sourceEvent: SQSSourceEvent) => {
  try {
    const params = {
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify({
        action: 'sendOnlineUsers',
        sourceEvent
      })
    };

    const command = new SendMessageCommand(params);

    await client.send(command);
  } catch (e) {
    console.log('Error sending SQS Message', e);
  }
};
