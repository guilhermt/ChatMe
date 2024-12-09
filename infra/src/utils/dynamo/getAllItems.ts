import { client } from '../../clients/dynamo';
import {
  type QueryCommandInput,
  QueryCommand,
  type AttributeValue
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

interface Keys {
  pk: string;
  sk?: string;
}

interface Filter {
  expression: string;
  attributeNames: Record<string, string>;
  attributeValues: Record<string, any>;
}

type LastKey = Record<string, AttributeValue>;

interface Props {
  keys: Keys;
  filter?: Filter;
  index?: string;
}

const TableName = process.env.TABLE_NAME ?? '';

export const getAllDynamoItems = async <T>({ keys, filter, index }: Props) => {
  const generateKeyCondition = (key: string) => {
    if (key === 'sk') {
      return `begins_with(sk, :${key})`;
    }
    return `${key} = :${key}`;
  };

  const KeyConditionExpression = Object.keys(keys)
    .map(generateKeyCondition)
    .join(' AND ');

  const FilterExpression = filter?.expression;

  const ExpressionAttributeNames = filter?.attributeNames;

  const attributeValues = Object.entries({
    ...keys,
    ...(filter?.attributeValues ?? {})
  });

  const ExpressionAttributeValues = attributeValues.reduce(
    (prev, [key, value]) => ({ ...prev, [`:${key}`]: marshall(value) }),
    {}
  );

  const baseParams: QueryCommandInput = {
    TableName,
    IndexName: index,
    KeyConditionExpression,
    FilterExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues
  };

  const items: T[] = [];
  let activeLastKey: LastKey | undefined;

  const getItemsChunk = async () => {
    const params: QueryCommandInput = {
      ...baseParams,
      ExclusiveStartKey: activeLastKey
    };

    const command = new QueryCommand(params);

    const res = await client.send(command);

    const rawItems = res.Items ?? [];

    const resItems = rawItems.map((item) => unmarshall(item)) as T[];

    items.push(...resItems);

    activeLastKey = res.LastEvaluatedKey;
  };

  const getItems = async () => {
    await getItemsChunk();

    if (activeLastKey) await getItems();
  };

  await getItems();

  return items;
};
