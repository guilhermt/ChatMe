import { Avatar, Badge, Button, Card, Center, Flex, Image, Indicator, Loader, ScrollAreaAutosize, Skeleton, Stack, Text, TextInput, UnstyledButton } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconLogout, IconPlus, IconSearch } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { useCallback, useRef } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { NewChatModal } from '@/components/NewChatModal';
import { useChats } from '@/contexts/Chats';
import { Models } from '@/@types/models';
import { useAuth } from '@/contexts/Authentication';
import { getChatLabel } from '@/utils/getChatTimeLabel';
import { useClearAllContexts } from '@/hooks/useClearContexts';

export const NavBar = () => {
  const isMobile = useIsMobile();

  const navigate = useNavigate();

  const { handleLogout } = useAuth();

  const clearAllContexts = useClearAllContexts();

  const { chats, activeChat, setActiveChat, search, setSearch, handlePaginate } = useChats();

  const observer = useRef<IntersectionObserver>();

  const lastItemRef = useCallback(
    (node: HTMLDivElement) => {
      if (chats.isLoading || !chats.lastKey) return;

      if (observer.current) observer.current?.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          handlePaginate();
        }
      });

      if (node) observer.current.observe(node);
    },
    [chats.isLoading, chats.lastKey]
  );

  const handleNewChatClick = () => modals.open({
    title: <Text fz={22} fw={500}>Nova conversa</Text>,
    children: <NewChatModal />,
    centered: !isMobile,
    overlayProps: {
      blur: 2,
    },
    size: 'xl',
  });

  const handleLogoutClick = () => {
    handleLogout();
    clearAllContexts();
  };

  const renderDesktopLogo = () => (
    <Flex w="100%" justify="center" mt="md" mb="sm">
      <UnstyledButton onClick={() => navigate('/')}>
        <Flex align="center" gap="xs">
          <Image src="/svg/logo-chat-me.svg" w={50} />

          <Text fw={500} fz={30} c="dark.9">
            ChatMe
          </Text>
        </Flex>
      </UnstyledButton>
    </Flex>
  );

  const renderChat = (chat: Models.Chat, index: number, arr: Models.Chat[]) => {
    const { name, profilePicture, isOnline } = chat.contact;

    const isActive = activeChat?.id === chat.id;

    const isLast = index === arr.length - 1;

    const refValue = isLast ? lastItemRef : null;

    const newMessages = chat.unreadMessages;

    return (
      <UnstyledButton
        onClick={() => setActiveChat(chat)}
        key={chat.id}
      >
        <Card
          p="10px 12px"
          bg={isActive ? 'grape.1' : ''}
          ref={refValue}
          style={{ transition: 'background-color 0.1s ease' }}
          onMouseEnter={(e) => {
            if (!isActive) e.currentTarget.style.backgroundColor = '#f0f0f0';
          }}
          onMouseLeave={(e) => {
            if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Flex gap="xs" align="center">
            <Indicator color="green" position="bottom-end" size={15} offset={4} withBorder disabled={!isOnline}>
              <Avatar src={profilePicture} size={45} />
            </Indicator>

            <Stack gap={4} w="100%">
              <Flex justify="space-between" align="center">
                <Text fz={16} fw={500} lh={1.2}>{name}</Text>

                <Text fz={13} fw={500} c="dark.3">{getChatLabel(chat.updatedAt)}</Text>
              </Flex>

              <Flex justify="space-between" align="center">
                <Text fz={13} fw={400} c="dark.3">{chat.lastMessage || 'Comece a conversar'}</Text>

                {!!newMessages && <Badge circle>{newMessages}</Badge>}
              </Flex>
            </Stack>
          </Flex>
        </Card>
      </UnstyledButton>
    );
  };

  const renderChatPlaceholder = (_: unknown, i: number) => (
    <Card p="8px 10px" key={i}>
      <Flex gap="xs" align="center">
        <Skeleton h={50} w="100%" maw={50} radius="xl" />

        <Stack gap={8} w="100%">
          <Skeleton h={10} w="70%" />

          <Skeleton h={10} w="95%" />
        </Stack>
      </Flex>
    </Card>
  );

  const renderLoader = () => (
    <Center w="100%" h={40}>
      <Loader size="sm" />
    </Center>
  );

  const placeholderCards = Array.from({ length: 11 }).map(renderChatPlaceholder);

  const isReloading = chats?.isLoading === 'search';

  const isPaginating = !isReloading && !!chats.lastKey;

  return (
    <Stack h="100%" bg={isMobile ? '' : '#fff'} pl="sm" pr="sm" pb="md">
      {!isMobile && renderDesktopLogo()}

      <Flex justify="space-between" align="center">
        <Text ta="start" fz={16} fw={500} c="dark.9">
            Conversas
        </Text>

        <Button
          variant="subtle"
          w="fit-content"
          style={{ alignSelf: 'center' }}
          leftSection={<IconPlus size={20} />}
          size="sm"
          onClick={handleNewChatClick}
        >
            Nova
        </Button>
      </Flex>

      <TextInput
        placeholder="Encontre conversas"
        leftSection={<IconSearch size={20} />}
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <ScrollAreaAutosize h="100%" scrollbarSize={10}>
        <Stack gap="0">
          {isReloading ? placeholderCards : chats.data.map(renderChat)}
        </Stack>

        {isPaginating && renderLoader()}
      </ScrollAreaAutosize>

      <Button
        fullWidth
        variant="subtle"
        style={{ alignSelf: 'center' }}
        leftSection={<IconLogout size={20} />}
        size="sm"
        onClick={handleLogoutClick}
      >
        Sair
      </Button>
    </Stack>
  );
};
