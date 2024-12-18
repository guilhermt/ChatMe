import { ActionIcon, Avatar, Button, Card, Center, Container, Divider, Flex, Image, Indicator, Loader, LoadingOverlay, ScrollAreaAutosize, Stack, Text, TextInput, ThemeIcon } from '@mantine/core';
import { IconArrowLeft, IconSend } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useChats } from '@/contexts/Chats';
import { getLastSeenLabel } from '@/utils/getLastSeenLabel';
import { getFormattedHour } from '@/utils/getFormattedHour';
import { useMessages } from '@/contexts/Messages';
import { Models } from '@/@types/models';
import { useWebSocket } from '@/contexts/WebSocket';
import { useIsMobile } from '@/hooks/useIsMobile';

interface NewMessageForm {
  text: string
}

export const Main = () => {
  const { activeChat, setActiveChat } = useChats();

  const isMobile = useIsMobile();

  const { messages, handleSendMessage, handlePaginate } = useMessages();

  const { handleEmitTypingChat } = useWebSocket();

  const scrollRef = useRef<HTMLDivElement>(null);

  const observer = useRef<IntersectionObserver>();

  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const lastItemRef = useCallback(
    (node: HTMLDivElement) => {
      if (messages.isLoading || !messages.lastKey) return;

      if (observer.current) observer.current?.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          handlePaginate();
        }
      });

      if (node) observer.current.observe(node);
    },
    [messages.isLoading, messages.lastKey]
  );

  const [initialScroll, setInitialScroll] = useState(true);

  const handleTyping = () => {
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    } else {
      handleEmitTypingChat({
        chatId: activeChat?.id!,
        contactId: activeChat?.contactId!,
        isTyping: true,
      });
    }

    typingTimeout.current = setTimeout(() => {
      typingTimeout.current = null;

      handleEmitTypingChat({
        chatId: activeChat?.id!,
        contactId: activeChat?.contactId!,
        isTyping: false,
      });
    }, 2500);
  };

  const form = useForm<NewMessageForm>({
    initialValues: {
      text: '',
    },
    validate: {
      text: value => value.trim() ? null : 'message cannot be empty',
    },
  });

  const { name, profilePicture, lastSeen, isOnline } = activeChat?.contact ?? {};

  const handleSubmitMessage = (data: NewMessageForm) => {
    handleSendMessage(data.text);

    handleEmitTypingChat({
      chatId: activeChat?.id!,
      contactId: activeChat?.contactId!,
      isTyping: false,
    });

    form.reset();
  };

  const renderNoChatMessage = () => (
    <Container className="module-container">
      <Center h="100vh">
        <Stack align="center">
          <ThemeIcon size={130} variant="light" p="sm" radius="lg">
            <Image src="/svg/logo-chat-me.svg" />
          </ThemeIcon>

          <Text fz={20} fw={500} c="dark.4">Selecione um inicie uma nova conversa</Text>
        </Stack>
      </Center>
    </Container>
  );

  const renderMessage = (message: Models.Message, index: number) => {
    const { senderId, content: { data }, createdAt } = message;

    const isSentByUser = senderId !== activeChat?.contactId;

    const isLast = index === 10;

    const refValue = isLast ? lastItemRef : null;

    return (
      <Stack align={isSentByUser ? 'end' : 'start'} gap={0} key={message.createdAt} ref={refValue}>
        <Card w="fit-content" p="8px 10px" bg={isSentByUser ? 'grape.1' : ''} radius="md" maw="65%" withBorder pos="relative">

          <Text lh={1.2} style={{ wordBreak: 'break-word' }}>{data} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Text>

          <Text fz={10} fw={400} c="dark.4" pos="absolute" right={8} bottom={4}>{getFormattedHour(createdAt)}</Text>
        </Card>

      </Stack>
    );
  };

  const renderMessagesWithDateHeaders = () => {
    let lastDate: string | null = null;

    const todayDate = new Date().toLocaleDateString();

    const yesterdayDate = new Date(Date.now() - (1000 * 60 * 60 * 24)).toLocaleDateString();

    const getDateLabel = (date: string) => {
      if (date === todayDate) return 'Hoje';

      if (date === yesterdayDate) return 'Ontem';

      return date;
    };

    return messages.data.map((message, index) => {
      const messageDate = new Date(message.createdAt).toLocaleDateString();

      const isNewDate = messageDate !== lastDate;

      lastDate = messageDate;

      return (
        <div key={message.id}>
          {isNewDate && (
            <Center>
              <Text fz={14} fw={500} c="dark.4" mt="md" mb="xs">
                {getDateLabel(messageDate)}
              </Text>
            </Center>
          )}

          {renderMessage(message, index)}
        </div>
      );
    });
  };

  const renderLoader = () => (
    <Center w="100%" h={40}>
      <Loader size="sm" />
    </Center>
  );

  const getUserLabel = () => {
    if (activeChat?.isTyping) return 'digitando...';

    if (isOnline) return 'online';

    return getLastSeenLabel(lastSeen!);
  };

  useEffect(() => {
    if (!messages.data.length) return;

    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 300;

    if (!isAtBottom && !initialScroll) return;

    const behavior = initialScroll ? 'instant' : 'smooth';

    scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior });

    if (initialScroll) setInitialScroll(false);
  }, [messages.data]);

  useEffect(() => {
    setInitialScroll(true);

    form.reset();
  }, [activeChat?.id]);

  if (!activeChat && !isMobile) return renderNoChatMessage();

  const isReloading = messages?.isLoading === 'search';

  const isPaginating = !isReloading && !!messages.lastKey;

  return (
    <Container className="module-container">
      <Stack w="100%" h="100%" pos="relative" gap={0}>
        <Flex align="center">
          {isMobile && (
            <ActionIcon
              variant="transparent"
              size="xl"
              color="dark.6"
              styles={{ root: { paddingRight: 8 } }}
              onClick={() => setActiveChat(null)}
            >
              <IconArrowLeft />
            </ActionIcon>
          )}

          <Flex gap="xs" align="center">
            <Indicator color="green" position="bottom-end" size={15} offset={5} withBorder disabled={!isOnline}>
              <Avatar src={profilePicture} size={50} />
            </Indicator>

            <Stack gap={6} w="100%">
              <Text fz={18} fw={500} lh={1}>{name}</Text>

              <Text fz={16} fw={400} lh={1} c="dark.3">{getUserLabel()}</Text>
            </Stack>
          </Flex>
        </Flex>

        <Divider mt={isMobile ? 8 : 16} />

        <LoadingOverlay
          visible={isReloading}
          overlayProps={{ backgroundOpacity: 0 }}
          loaderProps={{ type: 'bars' }}
        />

        <ScrollAreaAutosize h="100%" viewportRef={scrollRef} scrollbarSize={0}>
          <Stack gap={isMobile ? 4 : 'xs'} p={isMobile ? 0 : '0 200px'}>

            {isPaginating && renderLoader()}

            {renderMessagesWithDateHeaders()}
          </Stack>
        </ScrollAreaAutosize>

        <form onSubmit={form.onSubmit(handleSubmitMessage)}>
          <Flex gap="xs" mt={isMobile ? 4 : 8} ml={4} mr={4}>
            <TextInput
              w="100%"
              size="lg"
              autoComplete="off"
              {...form.getInputProps('text')}
              onChangeCapture={handleTyping}
              radius="xl"
            />

            <Button
              h={50}
              miw={50}
              p={0}
              type="submit"
              radius="xl"
              disabled={!form.isValid()}
            >
              <IconSend size={26} />
            </Button>
          </Flex>
        </form>

      </Stack>
    </Container>
  );
};
