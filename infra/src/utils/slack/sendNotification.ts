import { configEnv } from '../../config';

export const sendSlackNotification = async (channel: string, blocks: any) => {
  const url = 'https://slack.com/api/chat.postMessage';

  const headers = {
    Authorization: `Bearer ${configEnv.slackToken}`,
    'Content-Type': 'application/json'
  };

  const body = JSON.stringify({
    channel,
    blocks
  });

  try {
    await fetch(url, {
      method: 'POST',
      headers,
      body
    });
  } catch (e) {
    console.error('Error sending message:', e);
  }
};
