import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useCookies } from 'react-cookie';
import { useLocation } from 'react-router-dom';
import { Models } from '@/@types/models';

interface WebSocketContextData {
  onlineUsers: string[];
  subscribeToMessages: (callback: MessageHandler) => void
  handleEmitMessage: (props: EmitMessageProps) => void
  resetWebSocketContext: () => void;
}

interface Props {
  children: React.ReactNode;
}

enum EventType {
  ONLINE_USERS = 'online_users',
  RECEIVED_MESSAGE = 'received_message'
}

interface OnlineUsersEvent {
  eventType: EventType.ONLINE_USERS
  onlineUsers: string[]
}

export interface ReceivedMessageEvent {
  eventType: EventType.RECEIVED_MESSAGE
  message: Models.Message
  contactId: string;
}

type EventData = OnlineUsersEvent | ReceivedMessageEvent;

type MessageHandler = (data: ReceivedMessageEvent) => void;

interface EmitMessageProps {
  message: string;
  chatId: string
  contactId: string
}

interface SendMessageEvent {
  action: 'sendMessage',
  data: {
    message: Models.Message['content']
    chatId: string;
    contactId: string
  }
}

const context = createContext<WebSocketContextData>({} as WebSocketContextData);

const url = import.meta.env.VITE_WEBSOCKET_API_URL;

export const WebSocketProvider: React.FC<Props> = ({ children }) => {
  const [{ accessToken }] = useCookies(['accessToken']);

  console.log({ accessToken });

  const location = useLocation();

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const socketRef = useRef<WebSocket | null>(null);

  const messageHandler = useRef<MessageHandler | null>(null);

  const addSocketHandlers = () => {
    if (!socketRef.current) return;

    console.log('Adding socket handlers');

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data) as EventData;

      if (data.eventType === EventType.ONLINE_USERS) {
        setOnlineUsers(data.onlineUsers);
      }

      if (data.eventType === EventType.RECEIVED_MESSAGE) {
        messageHandler.current?.(data);
      }
    };
  };

  const subscribeToMessages = useCallback((callback: MessageHandler) => {
    messageHandler.current = callback;

    addSocketHandlers();
  }, []);

  const handleEmitMessage = useCallback(({ message, chatId, contactId }: EmitMessageProps) => {
    if (!socketRef.current) return;

    console.log('Emiting new message', message);

    const event: SendMessageEvent = {
      action: 'sendMessage',
      data: {
        contactId,
        chatId,
        message: {
          type: 'text',
          data: message,
        },
      },
    };

    socketRef.current.send(JSON.stringify(event));
  }, [socketRef.current]);

  useEffect(() => {
    if (socketRef.current || !accessToken) return;

    const whiteList = ['/'];

    const path = location.pathname;

    const isAllowed = whiteList.includes(path);

    if (!isAllowed) return;

    const ws = new WebSocket(`${url}?token=${encodeURI(accessToken)}`);

    console.log('Creating the Socket');

    socketRef.current = ws;

    addSocketHandlers();
  }, [location, accessToken]);

  const resetWebSocketContext = useCallback(() => {
    setOnlineUsers([]);

    socketRef.current?.close();
    socketRef.current = null;
  }, []);

  const value = useMemo(
    () => ({
      onlineUsers,
      subscribeToMessages,
      handleEmitMessage,
      resetWebSocketContext,
    }),
    [
      onlineUsers,
      subscribeToMessages,
      handleEmitMessage,
      resetWebSocketContext,
    ]
  );

  return <context.Provider value={value}>{children}</context.Provider>;
};

export const useWebSocket = () => {
  const ctx = useContext(context);

  if (!ctx) {
    throw new Error('Error inside of useWebSocket');
  }

  return ctx;
};
