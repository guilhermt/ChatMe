export const httpResponse = (content: string | object, statusCode = 200) => {
  const body = typeof content === 'string' ? { message: content } : content;

  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
};
