import { GetPaginatedDataInput } from '@/@types/common';
import { api } from '../api';
import { Chats } from './types';

const getChats = async ({ pageSize, lastKey, search, cancelToken }: GetPaginatedDataInput) => {
  const res = await api.get<Chats.GetChatsOutput>('/chats', {
    params: {
      search,
      pageSize,
      lastKey: JSON.stringify(lastKey),
    },
    cancelToken,
  });

  return res.data;
};

const startChat = async ({ userId }: Chats.StartChatInput) => {
  const res = await api.post<Chats.StartChatOutput>('/chats', {
    userId,
  });

  return res.data;
};

export const chats = {
  getChats,
  startChat,
};
