import { api } from '../api';
import { Messages } from './types';

const getMessages = async ({
  pageSize,
  lastKey,
  chatId,
  cancelToken,
}: Messages.GetMessagesInput) => {
  const res = await api.get<Messages.GetMessagesOutput>(`/messages/${chatId}`, {
    params: {
      pageSize,
      lastKey: JSON.stringify(lastKey),
    },
    cancelToken,
  });

  return res.data;
};

export const messages = {
  getMessages,
};
