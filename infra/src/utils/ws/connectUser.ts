import { DataType } from '../../@types/enums';
import { type Models } from '../../@types/models';
import { createDynamoItem } from '../dynamo/createItem';
import { createUpdateObject } from '../dynamo/createUpdateObject';
import { updateDynamoItem } from '../dynamo/editItem';

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

  const userKeys = {
    pk: 'user',
    sk: `user#${userId}`
  };

  const userPropsToUpdate: Partial<Models.User> = {
    lastSeen: now,
    updatedAt: now,
    gsi: now
  };

  const userUpdate = createUpdateObject(userPropsToUpdate);

  await Promise.all([
    updateDynamoItem(userKeys, userUpdate),
    createDynamoItem(newConnection)
  ]);
};
