import { Avatar, Button, FileButton, Flex, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { modals } from '@mantine/modals';
import { useAuth } from '@/contexts/Authentication';
import { compressImage } from '@/utils/compressImage';

interface EditProfileForm {
  name: string;
  profilePicture: File | null
}

export const UserProfileModal = () => {
  const { user, handleUpdateUserProfile } = useAuth();

  const { name, profilePicture } = (user.data!);

  const [loading, setLoading] = useState(false);

  const [imageUrl, setImageURL] = useState(profilePicture || '');

  const form = useForm<EditProfileForm>({
    initialValues: {
      name,
      profilePicture: null,
    },
    validate: {
      name: value => value.length < 3 ? 'Nome muito curto' : null,
    },
  });

  const handleSubmit = async (data: EditProfileForm) => {
    setLoading(true);

    try {
      await handleUpdateUserProfile(data);

      console.log(data);

      modals.closeAll();
    } catch (e) {
      console.log(e);
    }

    setLoading(false);
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) {
      form.setFieldValue('profilePicture', null);
      return;
    }

    const compressedImage = await compressImage(file);

    form.setFieldValue('profilePicture', compressedImage);

    const newImageUrl = URL.createObjectURL(compressedImage);

    setImageURL(newImageUrl);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="xs">

        <Stack align="center">
          <Avatar src={imageUrl} size={120} />

          <FileButton onChange={handleFileChange} accept="image/png,image/jpeg,image/webp">
            {(props) => <Button variant="subtle" {...props}>Alterar foto</Button>}
          </FileButton>
        </Stack>

        <TextInput
          label="Nome"
          placeholder="Digite seu nome"
          {...form.getInputProps('name')}
        />

        <Flex justify="end" gap="md">
          <Button variant="default" disabled={loading} onClick={modals.closeAll}>Voltar</Button>

          <Button type="submit" loading={loading}>Salvar</Button>
        </Flex>
      </Stack>
    </form>
  );
};
