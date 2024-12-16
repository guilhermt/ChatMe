import { AppShell } from '@mantine/core';
import { NavBar } from './NavBar';
import { useChats } from '@/contexts/Chats';

interface Props {
  children: JSX.Element;
}

export const MainLayout: React.FC<Props> = ({ children }) => {
  const { activeChat } = useChats();

  return (
    <AppShell
      navbar={{ width: 320, breakpoint: 'sm', collapsed: { mobile: !!activeChat } }}
    >
      <AppShell.Navbar>
        <NavBar />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};
