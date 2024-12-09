import { useMediaQuery } from '@mantine/hooks';

export enum Devices {
  FHD = 'fhd',
  HD = 'hd',
  MOBILE = 'mobile',
}

export const getDeviceByWindow = (): Devices => {
  const width = window.innerWidth;

  if (width >= 1400) return Devices.FHD;

  if (width >= 1000) return Devices.HD;

  return Devices.MOBILE;
};

export const useDevices = () => {
  const isFHD = useMediaQuery('(min-width: 1400px)');

  const isHD = useMediaQuery('(min-width: 1000px)');

  const isMobile = useMediaQuery('(max-width: 1000px)');

  if (isFHD) return Devices.FHD;

  if (isHD) return Devices.HD;

  if (isMobile) return Devices.MOBILE;

  return getDeviceByWindow();
};
