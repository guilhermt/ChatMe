import { getChannelId } from './getChannelId';
import { sendSlackNotification } from './sendNotification';

interface Props {
  name: string;
  email: string;
}

const getHeaderSection = (text: string) => ({
  type: 'header',
  text: {
    type: 'plain_text',
    text
  }
});

const getMarkdownSection = (text: string) => ({
  type: 'section',
  fields: [
    {
      type: 'mrkdwn',
      text
    }
  ]
});

const channel = getChannelId();

export const sendNewUserNotification = async ({
  name,
  email
}: Props) => {
  const blocks = [
    getHeaderSection('Novo Usuário'),

    getMarkdownSection(`*Nome:* ${name}`),

    getMarkdownSection(`*Email:* ${email}`)
  ];

  await sendSlackNotification(channel, blocks);
};
