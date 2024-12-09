import { Burger, Flex, Image, Text } from '@mantine/core';

interface Props {
  navbarOpened: boolean;
  toggleNavbar: () => void;
}

export const LayoutHeader = ({ navbarOpened, toggleNavbar }: Props) => (
  <Flex h="100%" justify="space-between" align="center">
    <Flex align="center" ml={10} gap="md">
      <Burger opened={navbarOpened} onClick={toggleNavbar} hiddenFrom="sm" />

      <Flex align="center" gap="xs">
        <Image src="/svg/logo-chat-me.svg" w={36} />

        <Text fw={500} fz={28} c="dark.9">
          ChatMe
        </Text>
      </Flex>
    </Flex>
  </Flex>
);
