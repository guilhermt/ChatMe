import { type APIGatewayEvent } from 'aws-lambda';
import { authorizer } from '../../../utils/requests/authorizer';
import { httpResponse } from '../../../utils/requests/httpResponse';
import { parsePaginatedQueryParams } from '../../../utils/requests/parseQueryParams';
import { getPaginatedItemsValidation } from '../../validation/common';
import { getPaginatedDynamoItems } from '../../../utils/dynamo/getPaginatedItems';
import { type Models } from '../../../@types/models';

export const handler = async (event: APIGatewayEvent) => {
  try {
    const authResponse = await authorizer(event);

    if (!('user' in authResponse)) {
      return authResponse;
    }

    const { user } = authResponse;

    const paginationParams = parsePaginatedQueryParams(event);

    const validation = getPaginatedItemsValidation(paginationParams);

    if (typeof validation === 'string') {
      return httpResponse(validation, 400);
    }

    const { pageSize, search, lastKey } = validation;

    const usersKeys = {
      pk: 'user'
    };

    const searchExpression = search ? ' AND contains(#nameAttr, :nameSearchValue)' : '';

    const filter = {
      expression: '#idAttr <> :userIdValue' + searchExpression,
      attributeNames: {
        '#idAttr': 'id',
        ...(search ? { '#nameAttr': 'searchName' } : {})
      },
      attributeValues: {
        userIdValue: user.id,
        ...(search ? { nameSearchValue: search.toLowerCase() } : {})
      }
    };

    const { items, lastEvaluetedKey } = await getPaginatedDynamoItems<Models.User>({
      keys: usersKeys,
      pageSize,
      lastKey,
      filter,
      inverse: true,
      gsi: true
    });

    const users = items.filter(item => item.id !== user.id);

    return httpResponse({ users, lastEvaluetedKey });
  } catch (e) {
    console.log(e);
    return httpResponse('Something went wrong.', 500);
  }
};
