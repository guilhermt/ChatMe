import { client } from '../../clients/dynamo';
import {
  type DeleteItemCommandInput,
  DeleteItemCommand
} from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

interface Item {
  pk: string;
  sk: string;
}

const TableName = process.env.TABLE_NAME ?? '';

export const deleteDynamoItem = async (item: Item) => {
  const params: DeleteItemCommandInput = {
    TableName,
    Key: marshall(item)
  };

  const command = new DeleteItemCommand(params);

  await client.send(command);
};
