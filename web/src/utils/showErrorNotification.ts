import { showNotification } from '@mantine/notifications';

export const showErrorNotification = () =>
  showNotification({
    title: 'Algo deu errado',
    message: 'Houve um problema. Por favor, tente novamente',
    color: 'red',
  });
