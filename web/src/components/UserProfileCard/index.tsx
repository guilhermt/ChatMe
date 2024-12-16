import { ActionIcon, Avatar, Card, Flex, Menu, MenuDropdown, MenuItem, MenuTarget, Skeleton, Stack, Text, ThemeIcon, UnstyledButton } from '@mantine/core';
import { IconChevronRight, IconLogout, IconSettings, IconUserEdit } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { useAuth } from '@/contexts/Authentication';
import { useClearAllContexts } from '@/hooks/useClearContexts';
import { UserProfileModal } from './UserProfileModal';
import { useIsMobile } from '@/hooks/useIsMobile';

interface Props {
  variant: 'card' | 'menu'
}

export const UserProfileButton = ({ variant }: Props) => {
  const { user, handleLogout } = useAuth();

  const isMobile = useIsMobile();

  const clearAllContexts = useClearAllContexts();

  const handleEditProfileClick = () => modals.open({
    title: <Text fz={22} fw={500}>Editar perfil</Text>,
    children: <UserProfileModal />,
    centered: !isMobile,
    overlayProps: {
      blur: 2,
    },
  });

  const handleLogoutClick = () => {
    handleLogout();
    clearAllContexts();
  };

  const { name, email, profilePicture } = user.data || {};

  const renderUserPlaceholder = () => (
    <Card p="xs" mih="fit-content">
      <Flex gap="xs" align="center">
        <Skeleton h={50} w="100%" maw={50} radius="xl" />

        <Stack gap={8} w="100%">
          <Skeleton h={10} w="85%" />

          <Skeleton h={10} w="75%" />
        </Stack>
      </Flex>
    </Card>
  );

  const renderCardTarget = () => (
    <UnstyledButton>
      <Card p="xs" mih="fit-content" bg="transparent">
        <Flex align="center" justify="space-between">
          <Flex gap="xs" align="center">
            <Avatar src={profilePicture} size={50} />

            <Stack gap={4} w="100%">
              <Text fz={16} fw={500} inline>{name}</Text>

              <Text fz={13} fw={500} c="dark.3" inline>{email}</Text>
            </Stack>
          </Flex>

          <ThemeIcon variant="transparent" color="dark.2">
            <IconChevronRight size={14} stroke={1.5} />
          </ThemeIcon>
        </Flex>
      </Card>
    </UnstyledButton>
  );

  const renderMenuButtonTarget = () => (
    <ActionIcon size={42} variant="default" radius="md">
      <IconSettings size={26} />
    </ActionIcon>
  );

  if (user.isLoading && variant === 'card') return renderUserPlaceholder();

  return (
    <Menu position={variant === 'card' ? 'top-end' : 'bottom-end'} offset={0} withArrow>
      <MenuTarget>
        {variant === 'card' ? renderCardTarget() : renderMenuButtonTarget()}
      </MenuTarget>

      <MenuDropdown p="12px 6px">
        <MenuItem
          leftSection={<IconUserEdit size={18} />}
          onClick={handleEditProfileClick}
        >
          Editar perfil
        </MenuItem>

        <MenuItem
          leftSection={<IconLogout size={18} />}
          color="red"
          onClick={handleLogoutClick}
        >
          Sair
        </MenuItem>
      </MenuDropdown>
    </Menu>
  );
};
