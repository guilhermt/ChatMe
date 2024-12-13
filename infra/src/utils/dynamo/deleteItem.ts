import { client } from '../../clients/dynamo';
import {
  type DeleteItemCommandInput,
  DeleteItemCommand
} from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { configEnv } from '../../config';

interface Item {
  pk: string;
  sk: string;
}

const TableName = configEnv.tableName;

export const deleteDynamoItem = async (item: Item) => {
  const params: DeleteItemCommandInput = {
    TableName,
    Key: marshall(item)
  };

  const command = new DeleteItemCommand(params);

  await client.send(command);
};
