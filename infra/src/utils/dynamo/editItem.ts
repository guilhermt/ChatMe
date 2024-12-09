import { client } from '../../clients/dynamo';
import {
  type UpdateItemCommandInput,
  UpdateItemCommand
} from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

interface Item {
  pk: string;
  sk: string;
}

interface Update {
  expression: string;
  attributeNames: Record<string, string>;
  attributeValues: Record<string, any>;
}

const TableName = process.env.TABLE_NAME ?? '';

export const updateDynamoItem = async (item: Item, update: Update) => {
  const params: UpdateItemCommandInput = {
    TableName,
    Key: marshall(item),
    UpdateExpression: update.expression,
    ExpressionAttributeNames: update.attributeNames,
    ExpressionAttributeValues: marshall(update.attributeValues)
  };

  const command = new UpdateItemCommand(params);

  await client.send(command);
};
