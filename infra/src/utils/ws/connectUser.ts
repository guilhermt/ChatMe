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
    createdAt: now,
    updatedAt: now,
    userId
  };

  await createDynamoItem(newConnection);
};
