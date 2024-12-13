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
  subscribeToMessages: (callback: MessageHandler) => void;
  subscribeToTypingChat: (callback: TypingChatHandler) => void;
  subscribeToNewChat: (callback: NewChatHandler) => void;
  handleEmitMessage: (props: EmitMessageProps) => void;
  handleEmitViewChat: (props: EmitViewChatProps) => void;
  handleEmitTypingChat: (props: EmitTypingChatProps) => void;
  resetWebSocketContext: () => void;
}

interface Props {
  children: React.ReactNode;
}

enum EventType {
  ONLINE_USERS = 'online_users',
  RECEIVED_MESSAGE = 'received_message',
  TYPING_CHAT = 'typing_chat',
  RECEIVED_NEW_CHAT = 'received_new_chat'
}

interface OnlineUsersEvent {
  eventType: EventType.ONLINE_USERS;
  onlineUsers: string[];
}

export interface ReceivedMessageEvent {
  eventType: EventType.RECEIVED_MESSAGE;
  message: Models.Message;
  contactId: string;
  chatId: string;
}

export interface ReceivedTypingChatEvent {
  eventType: EventType.TYPING_CHAT;
  chatId: string;
  isTyping: boolean
}

export interface ReceivedNewChatEvent {
  eventType: EventType.RECEIVED_NEW_CHAT
  chat: Models.Chat
}

type EventData =
  OnlineUsersEvent |
  ReceivedMessageEvent |
  ReceivedTypingChatEvent |
  ReceivedNewChatEvent;

type MessageHandler = (data: ReceivedMessageEvent) => void;

type TypingChatHandler = (data: ReceivedTypingChatEvent) => void;

type NewChatHandler = (data: ReceivedNewChatEvent) => void;

interface EmitMessageProps {
  message: string;
  chatId: string;
  contactId: string;
}

interface EmitViewChatProps {
  chatId: string;
}

interface EmitTypingChatProps {
  chatId: string;
  contactId: string;
  isTyping: boolean
}

interface SendMessageEvent {
  action: 'sendMessage',
  data: {
    message: Models.Message['content']
    chatId: string;
    contactId: string;
  }
}

interface ViewChatEvent {
  action: 'viewChat'
  data: {
    chatId: string;
  }
}

interface SendTypingChatEvent {
  action: 'typingChat'
  data: {
    chatId: string;
    contactId: string;
    isTyping: boolean
  }
}

const context = createContext<WebSocketContextData>({} as WebSocketContextData);

const url = import.meta.env.VITE_WEBSOCKET_API_URL;

export const WebSocketProvider: React.FC<Props> = ({ children }) => {
  const [{ accessToken }] = useCookies(['accessToken']);

  const location = useLocation();

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const socketRef = useRef<WebSocket | null>(null);

  const messageHandler = useRef<MessageHandler | null>(null);

  const typingChatHandler = useRef<TypingChatHandler | null>(null);

  const newChatHandler = useRef<NewChatHandler | null>(null);

  const addSocketHandlers = () => {
    if (!socketRef.current) return;

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data) as EventData;

      if (data.eventType === EventType.ONLINE_USERS) {
        setOnlineUsers(data.onlineUsers);
      }

      if (data.eventType === EventType.RECEIVED_MESSAGE) {
        messageHandler.current?.(data);
      }

      if (data.eventType === EventType.TYPING_CHAT) {
        typingChatHandler.current?.(data);
      }

      if (data.eventType === EventType.RECEIVED_NEW_CHAT) {
        newChatHandler.current?.(data);
      }
    };
  };

  const subscribeToMessages = useCallback((callback: MessageHandler) => {
    messageHandler.current = callback;

    addSocketHandlers();
  }, []);

  const subscribeToTypingChat = useCallback((callback: TypingChatHandler) => {
    typingChatHandler.current = callback;

    addSocketHandlers();
  }, []);

  const subscribeToNewChat = useCallback((callback: NewChatHandler) => {
    newChatHandler.current = callback;

    addSocketHandlers();
  }, []);

  const handleEmitMessage = useCallback(({ message, chatId, contactId }: EmitMessageProps) => {
    if (!socketRef.current) return;

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
  }, []);

  const handleEmitViewChat = useCallback(({ chatId }: EmitViewChatProps) => {
    if (!socketRef.current) return;

    const event: ViewChatEvent = {
      action: 'viewChat',
      data: {
        chatId,
      },
    };

    socketRef.current.send(JSON.stringify(event));
  }, []);

  const handleEmitTypingChat = useCallback((data: EmitTypingChatProps) => {
    if (!socketRef.current) return;

    const event: SendTypingChatEvent = {
      action: 'typingChat',
      data,
    };

    socketRef.current.send(JSON.stringify(event));
  }, []);

  console.log(socketRef.current?.readyState);

  useEffect(() => {
    if (socketRef.current || !accessToken) return;

    const whiteList = ['/'];

    const path = location.pathname;

    const isAllowed = whiteList.includes(path);

    if (!isAllowed) return;

    const ws = new WebSocket(`${url}?token=${encodeURI(accessToken)}`);

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
      subscribeToTypingChat,
      subscribeToNewChat,
      handleEmitMessage,
      handleEmitViewChat,
      handleEmitTypingChat,
      resetWebSocketContext,
    }),
    [
      onlineUsers,
      subscribeToMessages,
      subscribeToTypingChat,
      subscribeToNewChat,
      handleEmitMessage,
      handleEmitViewChat,
      handleEmitTypingChat,
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
