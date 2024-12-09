import { Button, Loader, PasswordInput, PinInput, Stack, Text } from '@mantine/core';
import { useState } from 'react';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { ResetPasswordForm } from './types';
import { useAuth } from '@/contexts/Authentication';

interface Props {
  email: string;
}

export const ResetPasswordModal = ({ email }: Props) => {
  const { handleSendNewPassword } = useAuth();

  const [loading, setLoading] = useState(false);

  const form = useForm<ResetPasswordForm>({
    initialValues: {
      email,
      code: '',
      newPassword: '',
    },
    validate: {
      newPassword: (value) => {
        const length = value.trim().length >= 6;

        if (length) return null;

        return 'Senha inválida';
      },
      code: (value) => (value.length >= 6 ? null : 'Código inválido'),
    },
  });

  const handleSubmit = async (data: ResetPasswordForm) => {
    setLoading(true);

    try {
      await handleSendNewPassword(data);
    } catch (e) {
      console.log(e);
    }

    setLoading(false);

    modals.closeAll();
  };

  return (
    <>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          <Text fz={18}>Insira o código enviado para o seu e-mail</Text>

          <Stack gap="xs" w="100%" align="center">
            <Text fz={14} fw={500}>
              Código de verificação
            </Text>

            <PinInput
              type="number"
              length={6}
              placeholder="-"
              onFocusCapture={(e) => {
                e.target.style.borderColor = 'var(--mantine-primary-color-filled)';
              }}
              onBlurCapture={(e) => {
                e.target.style.borderColor = '';
              }}
              {...form.getInputProps('code')}
            />
          </Stack>

          <PasswordInput
            required
            withAsterisk
            size="md"
            label="Nova senha"
            placeholder="Crie uma nova senha"
            description="Mínimo de 6 dígitos"
            {...form.getInputProps('newPassword')
            }
          />

          <Button disabled={loading} type="submit">
            {loading ? <Loader size={25} /> : 'Confirmar'}
          </Button>
        </Stack>
      </form>
    </>
  );
};
