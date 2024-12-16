import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import axios, { Canceler, CancelToken } from 'axios';
import { services } from '@/services';
import { Models } from '@/@types/models';
import { PaginatableContextData } from '@/@types/common';
import { useChats } from '../Chats';
import { ReceivedMessageEvent, useWebSocket } from '../WebSocket';
import { useAuth } from '../Authentication';

interface MessagesContextData {
  messages: Messages;
  handleSendMessage: (message: string) => void
  handlePaginate: () => void;
  resetMessagesContext: () => void;
}

type Messages = PaginatableContextData<Models.Message[]>;

interface FetchMessagesProps {
  chatId: string;
  lastKey?: Record<string, any> | null;
  cancelToken?: CancelToken;
}

interface Props {
  children: React.ReactNode;
}

export const PAGE_SIZE = 50;

const context = createContext<MessagesContextData>({} as MessagesContextData);

export const MessagesProvider: React.FC<Props> = ({ children }) => {
  const { subscribeToMessages, handleEmitMessage } = useWebSocket();

  const { user } = useAuth();

  const { activeChat, handleUpdateChatOnMessage } = useChats();

  const contactId = activeChat?.contactId;

  const chatId = activeChat?.id;

  const userId = user.data?.id;

  const hasLoaded = useRef(false);

  const [messages, setMessages] = useState<Messages>({
    data: [],
    isLoading: false,
    lastKey: null,
  });

  const handleFetchData = useCallback(async (
    { chatId, lastKey, cancelToken }: FetchMessagesProps) => {
    setMessages((p) => ({
      ...p,
      isLoading: lastKey ? 'paginate' : 'search',
    }));

    try {
      const { messages, lastEvaluetedKey } = await services.messages.getMessages({
        pageSize: PAGE_SIZE,
        chatId,
        lastKey,
        cancelToken,
      });

      setMessages((p) => ({
        data: lastKey ? [...messages, ...p.data] : messages,
        isLoading: false,
        lastKey: lastEvaluetedKey,
      }));

      hasLoaded.current = true;
    } catch (e) {
      console.log(e);
    }
  }, []);

  const handlePaginate = async () => {
    if (messages.isLoading) return;

    if (!messages.lastKey) return;

    if (!chatId) return;

    await handleFetchData({ chatId, lastKey: messages.lastKey });
  };

  const handleMessageReceived = useCallback((data: ReceivedMessageEvent) => {
    const { chatId, message, contactId } = data;

    handleUpdateChatOnMessage({
      chatId,
      message: message.content.data,
      isIncome: true,
    });

    if (contactId !== activeChat?.contactId) return;

    setMessages(p => ({
      ...p,
      data: [...p.data, message],
    }));
  }, [contactId]);

  const handleSendMessage = useCallback((message: string) => {
    if (!contactId || !chatId || !userId) return;

    handleEmitMessage({ message, contactId, chatId });

    handleUpdateChatOnMessage({
      chatId,
      message,
    });

    const now = Date.now();

    const newMessage = {
      chatId,
      createdAt: now,
      updatedAt: now,
      content: {
        type: 'text',
        data: message,
      },
      senderId: userId,
      receiverId: contactId,
    } as Models.Message;

    setMessages(p => ({
      ...p,
      data: [...p.data, newMessage],
    }));
  }, [contactId, chatId, userId]);

  useEffect(() => {
    subscribeToMessages(handleMessageReceived);
  }, [handleMessageReceived]);

  useEffect(() => {
    setMessages({
      data: [],
      isLoading: false,
      lastKey: null,
    });
    if (!chatId) return () => {};

    let cancel: Canceler;

    const cancelToken = new axios.CancelToken((c) => {
      cancel = c;
    });

    handleFetchData({ chatId, cancelToken });

    return () => {
      cancel();
    };
  }, [chatId]);

  const resetMessagesContext = useCallback(() => {
    setMessages({
      data: [],
      isLoading: false,
      lastKey: null,
    });

    hasLoaded.current = false;
  }, []);

  const value = useMemo(
    () => ({
      messages,
      handleSendMessage,
      handlePaginate,
      resetMessagesContext,
    }),
    [
      messages,
      handleSendMessage,
      handlePaginate,
      resetMessagesContext,
    ]
  );

  return <context.Provider value={value}>{children}</context.Provider>;
};

export const useMessages = () => {
  const ctx = useContext(context);

  if (!ctx) {
    throw new Error('Error inside of useMessages');
  }

  return ctx;
};
