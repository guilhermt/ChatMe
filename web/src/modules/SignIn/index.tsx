import {
  Anchor,
  Button,
  Card,
  Flex,
  Image,
  Loader,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { modals } from '@mantine/modals';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/Authentication';
import { ResetPasswordModal } from './ResetPasswordModal';
import { useIsMobile } from '@/hooks/useIsMobile';

interface FormData {
  email: string;
  password: string;
}

export const SignIn = () => {
  const isMobile = useIsMobile();

  const navigate = useNavigate();

  const form = useForm<FormData>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) =>
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value) ? null : 'E-mail inválido',
    },
  });

  const { handleSignIn, handleRequestNewPassword } = useAuth();

  const [error, setError] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSignInSubmit = async (data: FormData) => {
    setError('');
    setIsLoading(true);

    try {
      await handleSignIn(data);
    } catch (e) {
      setError((e as Error).message);
    }

    setIsLoading(false);
  };

  const handleForgotPassword = async () => {
    if (isLoading) return;

    const { email } = form.values;

    if (form.validateField('email').hasError) return;

    setError('');

    setIsLoading(true);

    try {
      await handleRequestNewPassword({ email });

      modals.open({
        title: <Text fz={20}>Redefinir senha</Text>,
        centered: true,
        children: <ResetPasswordModal email={email} />,
        overlayProps: {
          blur: 2,
        },
      });
    } catch (e) {
      setError((e as Error).message);
    }

    setIsLoading(false);
  };

  return (
    <Flex w="100vw" h="100vh" justify="space-between" align="center" pos="relative">
      <Flex
        w="100%"
        h="100%"
        align="center"
        justify="center"
        bg="var(--mantine-color-body)"
        pos="absolute"
        right={0}
        style={{ borderRadius: 18 }}
      >
        <Stack justify="start" w={isMobile ? '100%' : ''}>
          <Flex align="center" w="100%" justify="center" gap="md">
            <Image src="/svg/logo-chat-me.svg" w={80} />

            <Text fw={500} fz={50} c="dark.9">
              ChatMe
            </Text>
          </Flex>

          <Card radius="md" w={isMobile ? '100%' : 460} bg="transparent" p={isMobile ? '' : 0}>
            <form onSubmit={form.onSubmit((values) => handleSignInSubmit(values))}>
              <Stack gap={40}>
                <Text ta="center" fz={24}>
                  Faça login para acessar suas conversas
                </Text>

                <Stack>
                  <TextInput
                    label="E-mail"
                    placeholder="Digite seu e-mail"
                    size="md"
                    {...form.getInputProps('email')}
                  />

                  <Stack gap={4}>
                    <PasswordInput
                      label="Senha"
                      placeholder="Digite sua senha"
                      size="md"
                      {...form.getInputProps('password')}
                    />

                    <Anchor
                      c="var(--mantine-primary-color-8)"
                      onClick={handleForgotPassword}
                      fz={18}
                      fw={500}
                      style={{ alignSelf: 'end' }}
                    >
                    Esqueci minha senha
                    </Anchor>
                  </Stack>
                </Stack>

                <Stack>
                  <Button fullWidth size="md" type="submit" disabled={isLoading}>
                    {isLoading ? <Loader size="sm" /> : 'Entrar'}
                  </Button>

                  {error && (
                    <Text ta="center" c="red" fw={500} fz={18}>
                      {error}
                    </Text>
                  )}

                  <Text fw={500} ta="center" c="dark.6">
                      Ainda não tem uma conta?{' '}

                    <Anchor
                      c="var(--mantine-primary-color-8)"
                      onClick={() => navigate('/sign-up')}
                      fw={500}
                      style={{ alignSelf: 'center' }}
                    >
                        Clique aqui para criar
                    </Anchor>
                  </Text>
                </Stack>
              </Stack>
            </form>
          </Card>
        </Stack>
      </Flex>
    </Flex>
  );
};
