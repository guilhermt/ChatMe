import { useChats } from '@/contexts/Chats';
import { useMessages } from '@/contexts/Messages';
import { useUsers } from '@/contexts/Users';
import { useWebSocket } from '@/contexts/WebSocket';

export const useClearAllContexts = () => {
  const { resetUsersContext } = useUsers();
  const { resetChatsContext } = useChats();
  const { resetWebSocketContext } = useWebSocket();
  const { resetMessagesContext } = useMessages();

  const clearAllContexts = () => {
    resetUsersContext();
    resetChatsContext();
    resetWebSocketContext();
    resetMessagesContext();
  };

  return clearAllContexts;
};
