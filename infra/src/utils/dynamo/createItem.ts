import { client } from '../../clients/dynamo';
import {
  type PutItemCommandInput,
  PutItemCommand
} from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { type DynamoItem } from '../../@types/models';

interface Item extends DynamoItem {
  [key: string]: any;
}

const TableName = process.env.TABLE_NAME ?? '';

export const createDynamoItem = async (item: Item) => {
  const Item = marshall(item, { removeUndefinedValues: true });

  const params: PutItemCommandInput = {
    Item,
    TableName
  };

  const command = new PutItemCommand(params);

  await client.send(command);
};
