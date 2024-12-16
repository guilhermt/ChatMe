import { Avatar, Badge, Box, Button, Card, Center, Flex, Image, Indicator, Loader, ScrollAreaAutosize, Skeleton, Stack, Text, TextInput, UnstyledButton } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconSearch, IconMessage } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { useCallback, useRef } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { NewChatModal } from '@/components/NewChatModal';
import { useChats } from '@/contexts/Chats';
import { Models } from '@/@types/models';
import { getChatLabel } from '@/utils/getChatTimeLabel';
import { UserProfileButton } from '@/components/UserProfileCard';

export const NavBar = () => {
  const isMobile = useIsMobile();

  const navigate = useNavigate();

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

  const renderLogo = () => {
    if (isMobile) {
      return (
        <Flex align="center" justify="space-between" mt="md">
          <Flex align="center" gap="xs">
            <Image src="/svg/logo-chat-me.svg" w={36} />

            <Text fw={500} fz={28} c="dark.9">
              ChatMe
            </Text>
          </Flex>

          <UserProfileButton variant="menu" />
        </Flex>
      );
    }

    return (
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
  };

  const renderChat = (chat: Models.Chat, index: number, arr: Models.Chat[]) => {
    const { name, profilePicture, isOnline } = chat.contact;

    const isActive = activeChat?.id === chat.id;

    const isLast = index === arr.length - 1;

    const refValue = isLast ? lastItemRef : null;

    const newMessages = chat.unreadMessages;

    const fontSize = {
      name: isMobile ? 18 : 16,
      message: isMobile ? 15 : 13,
    };

    const getLabel = () => {
      if (chat.isTyping) {
        return (
          <Text fz={fontSize.message} fw={700} c="var(--mantine-primary-color-6)">
            digitando...
          </Text>);
      }

      return (
        <Text
          fz={fontSize.message}
          fw={400}
          c="dark.3"
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {chat.lastMessage || 'Comece a conversar'}
        </Text>);
    };

    return (
      <UnstyledButton
        onClick={() => setActiveChat(chat)}
        key={chat.id}
      >
        <Card
          p="10px 12px"
          bg={isActive ? 'grape.1' : 'transparent'}
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
            <Indicator color="green" position="bottom-end" size={15} offset={isMobile ? 7 : 5} withBorder disabled={!isOnline}>
              <Avatar src={profilePicture} size={isMobile ? 60 : 50} />
            </Indicator>

            <Stack gap={5} w="100%">
              <Flex justify="space-between" align="center">
                <Text fz={fontSize.name} fw={500} lh={1.2}>{name}</Text>

                <Text fz={fontSize.message} fw={500} c="dark.3">{getChatLabel(chat.updatedAt)}</Text>
              </Flex>

              <Flex justify="space-between" align="center">
                <Box maw={isMobile ? 280 : 180}>
                  {getLabel()}
                </Box>

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

  const noChats = !chats.isLoading && !chats.data.length;

  return (
    <Stack h="100%" bg={isMobile ? '' : '#fff'} pl="sm" pr="sm" pb={isMobile ? 0 : 'md'} gap={isMobile ? 'sm' : 'md'}>
      {renderLogo()}

      <Flex justify="space-between" align="center">
        <Text ta="start" fz={20} fw={500} c="dark.9">
          Conversas
        </Text>

        <Button
          variant="subtle"
          w="fit-content"
          style={{ alignSelf: 'center' }}
          leftSection={<IconMessage size={18} />}
          size={isMobile ? 'md' : 'sm'}
          onClick={handleNewChatClick}
        >
          Nova conversa
        </Button>
      </Flex>

      <TextInput
        placeholder="Encontre conversas"
        leftSection={<IconSearch size={20} />}
        value={search}
        onChange={e => setSearch(e.target.value)}
        size={isMobile ? 'md' : 'sm'}
      />

      <ScrollAreaAutosize h="100%" scrollbarSize={isMobile ? 0 : 10}>
        <Stack gap="0">
          {isReloading ? placeholderCards : chats.data.map(renderChat)}
        </Stack>

        {isPaginating && renderLoader()}

        {noChats && <Text ta="center">Nenhuma conversa encontrada</Text>}
      </ScrollAreaAutosize>

      {!isMobile && <UserProfileButton variant="card" />}
    </Stack>
  );
};
