import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import axios, { Canceler } from 'axios';
import { services } from '@/services';
import { Models } from '@/@types/models';
import { FetchContextDataProps, PaginatableContextData } from '@/@types/common';
import { useWebSocket } from '../WebSocket';

interface UsersContextData {
  users: Users;
  search: string;
  setSearch: (newValue: React.SetStateAction<string>) => void;
  handlePaginate: () => void;
  resetUsersContext: () => void;
}

type Users = PaginatableContextData<Models.User[]>;

interface Props {
  children: React.ReactNode;
}

export const PAGE_SIZE = 30;

const context = createContext<UsersContextData>({} as UsersContextData);

export const UsersProvider: React.FC<Props> = ({ children }) => {
  const location = useLocation();

  const { onlineUsers } = useWebSocket();

  const hasLoaded = useRef(false);

  const [users, setUsers] = useState<Users>({
    data: [],
    isLoading: false,
    lastKey: null,
  });

  const [search, setSearch] = useState<string>('');

  const handleFetchData = useCallback(async (
    { search, lastKey, cancelToken }: FetchContextDataProps) => {
    setUsers((p) => ({
      ...p,
      isLoading: lastKey ? 'paginate' : 'search',
    }));

    try {
      const { users, lastEvaluetedKey } = await services.users.getUsers({
        pageSize: PAGE_SIZE,
        search,
        lastKey,
        cancelToken,
      });

      const parsedUsers = users.map(user => ({
        ...user,
        isOnline: onlineUsers.includes(user.id),
      }));

      setUsers((p) => ({
        data: lastKey ? [...p.data, ...parsedUsers] : parsedUsers,
        isLoading: false,
        lastKey: lastEvaluetedKey,
      }));

      hasLoaded.current = true;
    } catch (e) {
      console.log(e);
    }
  }, [onlineUsers]);

  const handlePaginate = async () => {
    if (users.isLoading) return;

    if (!users.lastKey) return;

    await handleFetchData({ search, lastKey: users.lastKey });
  };

  useEffect(() => {
    if (!users.data.length) return;

    const updateUser = (user: Models.User) => {
      const isOnline = onlineUsers.includes(user.id);

      const isDisconnecting = user.isOnline && !isOnline;

      const lastSeen = isDisconnecting ? Date.now() : user.lastSeen;

      return {
        ...user,
        isOnline,
        lastSeen,
      };
    };

    setUsers(p => ({
      ...p,
      data: p.data.map(updateUser),
    }));
  }, [onlineUsers]);

  useEffect(() => {
    if (!hasLoaded.current) return () => {};

    let cancel: Canceler;

    const cancelToken = new axios.CancelToken((c) => {
      cancel = c;
    });

    handleFetchData({ search, cancelToken });

    return () => {
      cancel();
    };
  }, [search, hasLoaded]);

  useEffect(() => {
    if (hasLoaded.current) return;

    const whiteList = ['/'];

    const path = location.pathname;

    const isAllowed = whiteList.includes(path);

    if (!isAllowed) return;

    handleFetchData({});
  }, [hasLoaded.current, location.pathname]);

  const resetUsersContext = useCallback(() => {
    setUsers({
      data: [],
      isLoading: false,
      lastKey: null,
    });

    setSearch('');

    hasLoaded.current = false;
  }, []);

  const value = useMemo(
    () => ({
      users,
      search,
      setSearch,
      handlePaginate,
      resetUsersContext,
    }),
    [
      users,
      search,
      setSearch,
      handlePaginate,
      resetUsersContext,
    ]
  );

  return <context.Provider value={value}>{children}</context.Provider>;
};

export const useUsers = () => {
  const ctx = useContext(context);

  if (!ctx) {
    throw new Error('Error inside of useUsers');
  }

  return ctx;
};
