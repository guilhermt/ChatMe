export const clearObjectProperties = (
  rawObject: object
): Record<string, any> => {
  const entries = Object.entries(rawObject);

  const validEntries = entries.filter(
    (item) => item[1] === 0 || Boolean(item[1]) || typeof item[1] === 'boolean'
  );

  const parsedEntries = validEntries.map((item) => {
    if (typeof item[1] !== 'string') return item;

    return [item[0], item[1].trim()];
  });

  const object = Object.fromEntries(parsedEntries);

  return object;
};
