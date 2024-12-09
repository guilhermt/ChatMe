import { Devices, useDevices } from './useDevices';

export const useIsMobile = () => {
  const device = useDevices();

  const isMobile = device && device === Devices.MOBILE;

  return isMobile;
};
