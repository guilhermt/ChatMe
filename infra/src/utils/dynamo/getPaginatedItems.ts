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
  pageSize: number;
  lastKey?: LastKey;
  filter?: Filter;
  inverse?: boolean;
  gsi?: boolean
}

const TableName = process.env.TABLE_NAME ?? '';

export const getPaginatedDynamoItems = async <T>({
  keys,
  pageSize,
  lastKey,
  filter,
  inverse,
  gsi
}: Props) => {
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
    KeyConditionExpression,
    FilterExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
    Limit: pageSize,
    ScanIndexForward: !inverse,
    IndexName: gsi ? 'secondaryIndex' : undefined
  };

  const items: T[] = [];
  let activeLastKey = lastKey;

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

    if (items.length < pageSize && activeLastKey) await getItems();
  };

  await getItems();

  const result = {
    items,
    ...(activeLastKey ? { lastEvaluetedKey: activeLastKey } : {})
  };

  return result;
};
