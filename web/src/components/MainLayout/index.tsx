import { AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { LayoutHeader } from './Header';
import { NavBar } from './NavBar';
import { useIsMobile } from '@/hooks/useIsMobile';

interface Props {
  children: JSX.Element;
}

export const MainLayout: React.FC<Props> = ({ children }) => {
  const [opened, { toggle }] = useDisclosure();

  const isMobile = useIsMobile();

  return (
    <AppShell
      header={{ height: isMobile ? 65 : 0 }}
      navbar={{ width: 320, breakpoint: 'sm', collapsed: { mobile: !opened } }}
    >
      <AppShell.Header>
        <LayoutHeader navbarOpened={opened} toggleNavbar={toggle} />
      </AppShell.Header>

      <AppShell.Navbar>
        <NavBar />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};
