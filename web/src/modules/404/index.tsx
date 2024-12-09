import { Container, Text } from '@mantine/core';

export const NotFound = () => (
  <Container
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      height: '100vh',
      justifyContent: 'center',
    }}
  >
    <Text fz={30} fw={600}>
      Página não encontrada
    </Text>
  </Container>
);
