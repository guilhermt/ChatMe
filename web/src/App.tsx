import '@mantine/core/styles.css';
import {
  CSSVariablesResolver,
  MantineProvider,
  MantineThemeOverride,
  createTheme,
} from '@mantine/core';
import { Router } from './Router';
import { scales } from './contants/scales';
import { useDevices } from './hooks/useDevices';

export default function App() {
  const device = useDevices();

  const scale = scales[device];

  const theme: MantineThemeOverride = createTheme({
    scale,
    primaryColor: 'grape',
  });

  const resolver: CSSVariablesResolver = () => ({
    variables: {},
    light: {
      '--mantine-color-body': '#f8f8f8',
    },
    dark: {},
  });

  return (
    <MantineProvider theme={theme} defaultColorScheme="light" cssVariablesResolver={resolver}>
      <Router />
    </MantineProvider>
  );
}
