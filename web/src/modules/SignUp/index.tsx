import {
  Anchor,
  Button,
  Card,
  Container,
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
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/Authentication';
import { useIsMobile } from '@/hooks/useIsMobile';

interface SignUpForm {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export const SignUp = () => {
  const isMobile = useIsMobile();

  const navigate = useNavigate();

  const form = useForm<SignUpForm>({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
    },
    validate: {
      name: value => value.length < 3 ? 'Nome muito curto' : null,
      email: (value) =>
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value) ? null : 'E-mail inválido',
      phone: (value) => (value && value.length !== 15 ? 'Número inválido' : null),
      password: value => {
        if (value.length < 6) return 'A senha é muito curta';

        if (value.length > 15) return 'A senha é muito longa';

        return null;
      },
    },
  });

  const { handleSignUp } = useAuth();

  const [error, setError] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSignUpSubmit = async (data: SignUpForm) => {
    setError('');
    setIsLoading(true);

    try {
      await handleSignUp(data);
    } catch (e) {
      setError((e as Error).message);
    }

    setIsLoading(false);
  };

  return (
    <Container className="module-container">
      <Stack justify="center" align="center" h="100%" w="100%">
        <Flex align="center" w="100%" justify="center" gap="md">
          <Image src="/svg/logo-chat-me.svg" w={80} />

          <Text fw={500} fz={50} c="dark.9">
            ChatMe
          </Text>
        </Flex>

        <Text ta="center" fz={24} fw={500} c="dark.3">
          Crie sua conta
        </Text>

        <Card radius="md" w={isMobile ? '100%' : 460} bg="transparent" p={isMobile ? '' : 0}>
          <form onSubmit={form.onSubmit(handleSignUpSubmit)}>
            <Stack gap={40}>
              <Stack>
                <TextInput
                  required
                  label="Nome"
                  placeholder="Digite seu nome"
                  size="md"
                  {...form.getInputProps('name')}
                />

                <TextInput
                  required
                  label="E-mail"
                  placeholder="Digite seu e-mail"
                  size="md"
                  {...form.getInputProps('email')}
                />

                <PasswordInput
                  required
                  withAsterisk
                  label="Senha"
                  size="md"
                  placeholder="Crie uma senha"
                  description="Mínimo de 6 dígitos"
                  {...form.getInputProps('password')
                  }
                />
              </Stack>

              <Stack>
                <Button fullWidth size="md" type="submit" disabled={isLoading}>
                  {isLoading ? <Loader size="sm" /> : 'Cadastrar'}
                </Button>

                {error && (
                  <Text ta="center" c="red" fw={500} fz={18}>
                    {error}
                  </Text>
                )}

                <Text fw={500} ta="center" c="dark.6">
                  Já tem uma conta?{' '}

                  <Anchor
                    c="var(--mantine-primary-color-8)"
                    onClick={() => navigate('/sign-in')}
                    fw={500}
                    style={{ alignSelf: 'center' }}
                  >
                    Faça login
                  </Anchor>
                </Text>
              </Stack>
            </Stack>
          </form>
        </Card>
      </Stack>
    </Container>
  );
};
