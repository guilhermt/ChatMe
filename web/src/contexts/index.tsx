import { CookiesProvider } from 'react-cookie';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { PortalProps } from '@mantine/core';
import { AuthProvider } from './Authentication';
import { useScale } from '@/hooks/useScale';
import { UsersProvider } from './Users';
import { ChatsProvider } from './Chats';
import { MessagesProvider } from './Messages';
import { WebSocketProvider } from './WebSocket';

interface Props {
  children: React.ReactNode;
}

const AppProvider: React.FC<Props> = ({ children }) => {
  const scaled = useScale();

  const notificationsPortalProps: Omit<PortalProps, 'children'> = {
    style: {
      position: 'fixed',
      right: '1rem',
      bottom: '2rem',
      zIndex: 999,
      maxWidth: `${scaled(300)}px`,
    },
  };

  return (
    <CookiesProvider>
      <Notifications
        portalProps={notificationsPortalProps}
      />
      <AuthProvider>
        <WebSocketProvider>
          <UsersProvider>
            <ChatsProvider>
              <MessagesProvider>
                <ModalsProvider>{children}</ModalsProvider>
              </MessagesProvider>
            </ChatsProvider>
          </UsersProvider>
        </WebSocketProvider>
      </AuthProvider>
    </CookiesProvider>
  );
};

export default AppProvider;
