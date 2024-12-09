import { getFormattedHour } from './getFormattedHour';

export const getChatLabel = (lastUpdate: number) => {
  const now = new Date();
  const lastUpdateDate = new Date(lastUpdate);

  const isToday =
    now.getDate() === lastUpdateDate.getDate() &&
    now.getMonth() === lastUpdateDate.getMonth() &&
    now.getFullYear() === lastUpdateDate.getFullYear();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfLastUpdate = new Date(
    lastUpdateDate.getFullYear(),
    lastUpdateDate.getMonth(),
    lastUpdateDate.getDate()
  ).getTime();

  const days = Math.floor((startOfToday - startOfLastUpdate) / (1000 * 60 * 60 * 24));

  if (isToday) {
    return getFormattedHour(lastUpdate);
  }

  if (days < 5) {
    return `${days}d`;
  }

  const day = lastUpdateDate.getDate().toString().padStart(2, '0');
  const month = (lastUpdateDate.getMonth() + 1).toString().padStart(2, '0');
  return `${day}/${month}`;
};
