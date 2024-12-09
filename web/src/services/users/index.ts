import { GetPaginatedDataInput } from '@/@types/common';
import { api } from '../api';
import { Users } from './types';

const getUsers = async ({ pageSize, lastKey, search, cancelToken }: GetPaginatedDataInput) => {
  const res = await api.get<Users.GetUsersOutput>('/users', {
    params: {
      search,
      pageSize,
      lastKey: JSON.stringify(lastKey),
    },
    cancelToken,
  });

  return res.data;
};

export const users = {
  getUsers,
};
