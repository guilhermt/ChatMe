import { type Models } from '../../@types/models';
import { createUpdateObject } from '../dynamo/createUpdateObject';
import { deleteDynamoItem } from '../dynamo/deleteItem';
import { updateDynamoItem } from '../dynamo/editItem';

interface Props {
  userId: string;
  connectionId: string
}

export const disconnectUser = async ({ userId, connectionId }: Props) => {
  const connectionKeys = {
    pk: 'connection',
    sk: `connection#${connectionId}`
  };

  const userKeys = {
    pk: 'user',
    sk: `user#${userId}`
  };

  const now = Date.now();

  const userPropsToUpdate: Partial<Models.User> = {
    lastSeen: now,
    updatedAt: now
  };

  const userUpdate = createUpdateObject(userPropsToUpdate);

  await Promise.all([
    deleteDynamoItem(connectionKeys),
    updateDynamoItem(userKeys, userUpdate)
  ]);
};
