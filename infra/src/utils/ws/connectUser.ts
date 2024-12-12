import { DataType } from '../../@types/enums';
import { type Models } from '../../@types/models';
import { createDynamoItem } from '../dynamo/createItem';

interface Props {
  userId: string;
  connectionId: string
}

export const connectUser = async ({ userId, connectionId }: Props) => {
  const now = Date.now();

  const newConnection: Models.Connection = {
    pk: 'connection',
    sk: `connection#${connectionId}`,
    id: connectionId,
    dataType: DataType.CONNECTION,
    createdAt: now,
    updatedAt: now,
    userId
  };

  await createDynamoItem(newConnection);
};
