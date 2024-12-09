import { type APIGatewayEvent } from 'aws-lambda';

export const parsePaginatedQueryParams = (event: APIGatewayEvent) => {
  const queryParams = event.queryStringParameters;

  const params = {
    pageSize: Number(queryParams?.pageSize),
    lastKey: queryParams?.lastKey
      ? JSON.parse(queryParams.lastKey)
      : undefined,
    search: queryParams?.search
  };

  return params;
};
