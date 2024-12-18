import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import axios, { Canceler } from 'axios';
import { useLocation } from 'react-router-dom';
import { Models } from '@/@types/models';
import { FetchContextDataProps, PaginatableContextData } from '@/@types/common';
import { services } from '@/services';
import { showErrorNotification } from '@/utils/showErrorNotification';
import { ReceivedNewChatEvent, ReceivedTypingChatEvent, useWebSocket } from '../WebSocket';

interface ChatsContextData {
  chats: Chats;
  search: string;
  setSearch: (newValue: React.SetStateAction<string>) => void;
  activeChat: Models.Chat | null;
  setActiveChat: (newValue: React.SetStateAction<Models.Chat | null>) => void;
  handlePaginate: () => void;
  handleStartChat: (props: StartChatProps) => Promise<void>
  handleUpdateChatOnMessage: (props: UpdateChatOnMessageProps) => void
  resetChatsContext: () => void;
}

type Chats = PaginatableContextData<Models.Chat[]>;

interface StartChatProps {
  userId: string
}

interface UpdateChatOnMessageProps {
  chatId: string;
  message: string;
  isIncome?: boolean
}

interface Props {
  children: React.ReactNode;
}

export const PAGE_SIZE = 20;

const context = createContext<ChatsContextData>({} as ChatsContextData);

export const ChatsProvider: React.FC<Props> = ({ children }) => {
  const {
    onlineUsers,
    handleEmitViewChat,
    subscribeToTypingChat,
    subscribeToNewChat,
  } = useWebSocket();

  const location = useLocation();

  const hasLoaded = useRef(false);

  const [activeChat, setActiveChat] = useState<Models.Chat | null>(null);

  const [chats, setChats] = useState<Chats>({
    data: [],
    isLoading: false,
    lastKey: null,
  });

  const [search, setSearch] = useState<string>('');

  const handleFetchData = useCallback(async (
    { search, lastKey, cancelToken }: FetchContextDataProps) => {
    setChats((p) => ({
      ...p,
      isLoading: lastKey ? 'paginate' : 'search',
    }));

    try {
      const { chats, lastEvaluetedKey } = await services.chats.getChats({
        pageSize: PAGE_SIZE,
        search,
        lastKey,
        cancelToken,
      });

      const parsedChats = chats.map(chat => ({
        ...chat,
        contact: {
          ...chat.contact,
          isOnline: onlineUsers.includes(chat.contactId),
        },
      }));

      setChats((p) => ({
        data: lastKey ? [...p.data, ...parsedChats] : parsedChats,
        isLoading: false,
        lastKey: lastEvaluetedKey,
      }));

      hasLoaded.current = true;
    } catch (e) {
      console.log(e);
    }
  }, [onlineUsers]);

  const handlePaginate = async () => {
    if (chats.isLoading) return;

    if (!chats.lastKey) return;

    await handleFetchData({ search, lastKey: chats.lastKey });
  };

  const handleStartChat = useCallback(async ({ userId }: StartChatProps) => {
    try {
      const { chat } = await services.chats.startChat({ userId });

      const parsedChat = {
        ...chat,
        contact: {
          ...chat.contact,
          isOnline: onlineUsers.includes(chat.contactId),
        },
      };

      setActiveChat(parsedChat);

      setChats(p => ({
        ...p,
        data: [parsedChat, ...p.data.filter(c => c.id !== chat.id)],
      }));
    } catch (e) {
      console.log(e);
      showErrorNotification();
    }
  }, [onlineUsers]);

  const handleUpdateChatOnMessage = useCallback((props: UpdateChatOnMessageProps) => {
    const { chatId, message, isIncome } = props;

    const isActive = activeChat?.id === chatId;

    const isRead = isIncome && isActive;

    const isUnread = isIncome && !isActive;

    if (isRead) handleEmitViewChat({ chatId });

    setChats(p => {
      const updatedChats = p.data.map(chat => {
        if (chat.id !== chatId) return chat;

        const now = Date.now();

        const unreadMessages = chat.unreadMessages + (isUnread ? 1 : 0);

        return {
          ...chat,
          lastMessage: message,
          updatedAt: now,
          gsi: now,
          unreadMessages,
        };
      });

      const sortedChats = updatedChats.sort((a, b) => b.updatedAt - a.updatedAt);

      return {
        ...p,
        data: sortedChats,
      };
    });
  }, [activeChat]);

  const handleTypingChatReceived = useCallback((data: ReceivedTypingChatEvent) => {
    const { chatId, isTyping } = data;

    const updateChat = (chat: Models.Chat) => {
      if (chat.id !== chatId) return chat;

      return {
        ...chat,
        isTyping,
      };
    };

    setChats(p => ({
      ...p,
      data: p.data.map(updateChat),
    }));

    if (activeChat?.id !== chatId) return;

    setActiveChat(p => updateChat(p!));
  }, [activeChat]);

  const handleNewChatReceived = useCallback((data: ReceivedNewChatEvent) => {
    const { chat } = data;

    setChats(p => ({
      ...p,
      data: [chat, ...p.data],
    }));
  }, []);

  useEffect(() => {
    subscribeToTypingChat(handleTypingChatReceived);
  }, [handleTypingChatReceived]);

  useEffect(() => {
    subscribeToNewChat(handleNewChatReceived);
  }, [handleNewChatReceived]);

  useEffect(() => {
    if (!activeChat) return;

    const { unreadMessages, id } = activeChat;

    if (!unreadMessages) return;

    handleEmitViewChat({ chatId: id });

    setChats(p => ({
      ...p,
      data: p.data.map(chat => {
        if (chat.id !== id) return chat;

        return {
          ...chat,
          unreadMessages: 0,
        };
      }),
    }));
  }, [activeChat]);

  useEffect(() => {
    if (!chats.data.length && !activeChat) return;

    const updateChatContact = (chat: Models.Chat) => {
      const isOnline = onlineUsers.includes(chat.contactId);

      const isDisconnecting = chat.contact.isOnline && !isOnline;

      const lastSeen = isDisconnecting ? Date.now() : chat.contact.lastSeen;

      return {
        ...chat,
        contact: {
          ...chat.contact,
          isOnline,
          lastSeen,
        },
      };
    };

    setChats(p => ({
      ...p,
      data: p.data.map(updateChatContact),
    }));

    setActiveChat(p => p ? updateChatContact(p) : null);
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
  }, [search]);

  useEffect(() => {
    if (hasLoaded.current) return;

    const whiteList = ['/'];

    const path = location.pathname;

    const isAllowed = whiteList.includes(path);

    if (!isAllowed) return;

    handleFetchData({});
  }, [location]);

  const resetChatsContext = useCallback(() => {
    setChats({
      data: [],
      isLoading: false,
      lastKey: null,
    });

    setSearch('');

    setActiveChat(null);

    hasLoaded.current = false;
  }, []);

  const value = useMemo(
    () => ({
      chats,
      search,
      setSearch,
      activeChat,
      setActiveChat,
      handlePaginate,
      handleStartChat,
      handleUpdateChatOnMessage,
      resetChatsContext,
    }),
    [
      chats,
      search,
      setSearch,
      activeChat,
      setActiveChat,
      handlePaginate,
      handleStartChat,
      handleUpdateChatOnMessage,
      resetChatsContext,
    ]
  );

  return <context.Provider value={value}>{children}</context.Provider>;
};

export const useChats = () => {
  const ctx = useContext(context);

  if (!ctx) {
    throw new Error('Error inside of useChats');
  }

  return ctx;
};
