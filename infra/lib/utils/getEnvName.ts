export const getEnvName = (name: string, lowercase = false) => {
  const env = process.env.ENVIRONMENT ?? '';

  const envLabel = lowercase ? env.toLowerCase() : env.toUpperCase();

  return `${name}-${envLabel}`;
};
