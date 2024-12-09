import { Avatar, Button, Card, Center, Container, Divider, Flex, Image, Indicator, ScrollAreaAutosize, Stack, Text, TextInput, ThemeIcon } from '@mantine/core';
import { IconSend } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { useEffect, useRef, useState } from 'react';
import { useChats } from '@/contexts/Chats';
import { getLastSeenLabel } from '@/utils/getLastSeenLabel';
import { getFormattedHour } from '@/utils/getFormattedHour';
import { useMessages } from '@/contexts/Messages';
import { Models } from '@/@types/models';

interface NewMessageForm {
  text: string
}

export const Main = () => {
  const { activeChat } = useChats();

  const { messages, handleSendMessage } = useMessages();

  const scrollRef = useRef<HTMLDivElement>(null);

  const [initialScroll, setInitialScroll] = useState(true);

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

  const renderMessage = (message: Models.Message) => {
    const { senderId, content: { data }, createdAt } = message;

    const isSentByUser = senderId !== activeChat?.contactId;

    return (
      <Stack align={isSentByUser ? 'end' : 'start'} gap={0} key={message.createdAt}>
        <Card w="fit-content" p="8px 10px" bg={isSentByUser ? 'grape.1' : ''} radius="md" maw="65%" withBorder pos="relative">

          <Text lh={1.2}>{data} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Text>

          <Text fz={10} fw={400} c="dark.4" pos="absolute" right={8} bottom={4}>{getFormattedHour(createdAt)}</Text>
        </Card>

      </Stack>
    );
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
  }, [activeChat?.id]);

  if (!activeChat) return renderNoChatMessage();

  return (
    <Container className="module-container">
      <Stack w="100%" h="100%">

        <Flex gap="xs" align="center">
          <Indicator color="green" position="bottom-end" size={15} offset={4} withBorder disabled={!isOnline}>
            <Avatar src={profilePicture} size={50} />
          </Indicator>

          <Stack gap={6} w="100%">
            <Text fz={18} fw={500} lh={1}>{name}</Text>

            <Text fz={16} fw={400} lh={1} c="dark.3">{isOnline ? 'online' : getLastSeenLabel(lastSeen!)}</Text>
          </Stack>
        </Flex>

        <Divider />

        <ScrollAreaAutosize h="100%" viewportRef={scrollRef}>
          <Stack gap="xs" p="0 200px">
            {messages.data.map(renderMessage)}
          </Stack>
        </ScrollAreaAutosize>

        <form onSubmit={form.onSubmit(handleSubmitMessage)}>
          <Flex gap="md">
            <TextInput w="100%" size="md" autoComplete="off" {...form.getInputProps('text')} />

            <Button size="md" pl="lg" pr="lg" type="submit" disabled={!form.isValid()}><IconSend size={32} /></Button>
          </Flex>
        </form>

      </Stack>
    </Container>
  );
};
