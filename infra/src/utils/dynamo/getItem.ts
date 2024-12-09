import { client } from '../../clients/dynamo';
import { type QueryCommandInput, QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

interface Item {
  pk: string;
  sk?: string;
}

const TableName = process.env.TABLE_NAME ?? '';

export const getDynamoItem = async <T>(item: Item, skBeginsWith = false) => {
  const generateKeyCondition = (key: string) => {
    if (key === 'sk' && skBeginsWith) {
      return `begins_with(sk, :${key})`;
    }
    return `${key} = :${key}`;
  };

  const KeyConditionExpression = Object.keys(item)
    .map(generateKeyCondition)
    .join(' AND ');

  const ExpressionAttributeValues = Object.entries(item).reduce(
    (prev, [key, value]) => ({ ...prev, [`:${key}`]: marshall(value) }),
    {}
  );

  const params: QueryCommandInput = {
    TableName,
    KeyConditionExpression,
    ExpressionAttributeValues
  };

  const command = new QueryCommand(params);

  const res = await client.send(command);

  if (res.Count !== 1) return null;

  const itemFound = res.Items ? unmarshall(res.Items[0]) as T : null;

  return itemFound;
};
