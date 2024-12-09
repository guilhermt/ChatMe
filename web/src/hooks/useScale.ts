import { scales } from '@/contants/scales';
import { useDevices } from './useDevices';

export const useScale = () => {
  const device = useDevices();

  const scale = scales[device];

  const scaled = (value: number) => value * scale;

  return scaled;
};
