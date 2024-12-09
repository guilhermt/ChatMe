import { Avatar, Card, Center, Flex, Indicator, Loader, LoadingOverlay, ScrollArea, SimpleGrid, Skeleton, Stack, Text, TextInput, UnstyledButton } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useCallback, useRef, useState } from 'react';
import { modals } from '@mantine/modals';
import { useUsers } from '@/contexts/Users';
import { Models } from '@/@types/models';
import { getLastSeenLabel } from '@/utils/getLastSeenLabel';
import { useChats } from '@/contexts/Chats';

export const NewChatModal = () => {
  const { users, search, setSearch, handlePaginate } = useUsers();

  const { handleStartChat } = useChats();

  const [loading, setLoading] = useState<string | false>(false);

  const observer = useRef<IntersectionObserver>();

  const lastItemRef = useCallback(
    (node: HTMLDivElement) => {
      if (users.isLoading || !users.lastKey) return;

      if (observer.current) observer.current?.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          handlePaginate();
        }
      });

      if (node) observer.current.observe(node);
    },
    [users.isLoading, users.lastKey]
  );

  const handleUserClick = async (userId: string) => {
    setLoading(userId);

    try {
      await handleStartChat({ userId });

      modals.closeAll();
    } catch (e) {
      console.log(e);
    }

    setLoading(false);
  };

  const renderUserCard = (user: Models.User, index: number, arr: Models.User[]) => {
    const { id, profilePicture, name, lastSeen, isOnline } = user;
    const isLast = index === arr.length - 1;

    const isLoading = loading === id;

    const refValue = isLast ? lastItemRef : null;

    return (
      <UnstyledButton
        onClick={() => handleUserClick(id)}
        key={id}
        disabled={!!loading}
        style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
        pos="relative"
      >
        <LoadingOverlay visible={isLoading} loaderProps={{ size: 'sm' }} overlayProps={{ blur: 2, opacity: 0.8 }} />

        <Card p="xs" ref={refValue}>
          <Flex gap="xs" align="center">
            <Indicator color="green" position="bottom-end" size={15} offset={4} withBorder disabled={!isOnline}>
              <Avatar src={profilePicture} size={50} />
            </Indicator>

            <Stack gap={4}>
              <Text fz={16} fw={500} lh={1.2}>{name}</Text>

              <Text fz={13} fw={400} c="dark.3">{isOnline ? 'online' : getLastSeenLabel(lastSeen)}</Text>
            </Stack>
          </Flex>
        </Card>
      </UnstyledButton>
    );
  };

  const renderCardPlaceholder = () => (
    <Card p="xs">
      <Flex gap="xs" align="center">
        <Skeleton h={50} w="100%" maw={50} radius="xl" />

        <Stack gap={12} w="100%">
          <Skeleton h={10} w="70%" />

          <Skeleton h={8} w="40%" />
        </Stack>
      </Flex>
    </Card>
  );

  const renderLoader = () => (
    <Center w="100%" h={50}>
      <Loader size="sm" />
    </Center>
  );

  const placeholderCards = Array.from({ length: 18 }).map(() => renderCardPlaceholder());

  const isReloading = users.isLoading === 'search';

  const isPaginating = !isReloading && !!users.lastKey;

  return (
    <Stack>
      <TextInput
        leftSection={<IconSearch size={20} />}
        placeholder="Com quem deseja conversar?"
        value={search}
        onChange={(newSearch) => setSearch(newSearch.target.value)}
      />

      <ScrollArea h={500}>
        <SimpleGrid cols={3} pr="sm">
          {isReloading ? placeholderCards : users.data.map(renderUserCard)}
        </SimpleGrid>

        {isPaginating && renderLoader()}

      </ScrollArea>
    </Stack>
  );
};
