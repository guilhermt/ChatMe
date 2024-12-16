import { Devices } from '@/hooks/useDevices';

export const scales: Record<Devices, number> = {
  [Devices.FHD]: 1,
  [Devices.HD]: 0.7,
  [Devices.MOBILE]: 0.90,
};
