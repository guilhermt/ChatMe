export const getLastSeenLabel = (lastSeen: number) => {
  const now = new Date();
  const lastSeenDate = new Date(lastSeen);

  const isToday =
    now.getDate() === lastSeenDate.getDate() &&
    now.getMonth() === lastSeenDate.getMonth() &&
    now.getFullYear() === lastSeenDate.getFullYear();

  const hours = lastSeenDate.getHours().toString().padStart(2, '0');
  const minutes = lastSeenDate.getMinutes().toString().padStart(2, '0');

  if (isToday) return `visto hoje às ${hours}h${minutes}`;

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfLastUpdate = new Date(
    lastSeenDate.getFullYear(),
    lastSeenDate.getMonth(),
    lastSeenDate.getDate()
  ).getTime();

  const days = Math.floor((startOfToday - startOfLastUpdate) / (1000 * 60 * 60 * 24));

  if (days === 1) return `visto ontem às ${hours}h${minutes}`;

  const day = lastSeenDate.getDate().toString().padStart(2, '0');
  const month = lastSeenDate.getMonth().toString().padStart(2, '0');

  return `visto em ${day}/${month}`;
};
