import { type APIGatewayProxyEvent } from 'aws-lambda';
import { httpResponse } from '../../utils/requests/httpResponse';
import { disconnectUser } from '../../utils/ws/disconnectUser';
import { sendSQSMessage, type SQSSourceEvent } from '../../utils/sqs/sendMessage';
import { getDynamoItem } from '../../utils/dynamo/getItem';
import { type Models } from '../../@types/models';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const connectionId = event.requestContext.connectionId!;

    const connection = await getDynamoItem<Models.Connection>({ pk: 'connection', sk: `connection#${connectionId}` });

    if (!connection) return httpResponse({});

    const { userId } = connection;

    await disconnectUser({ connectionId, userId });

    const sqsEvent: SQSSourceEvent = {
      type: 'disconnect',
      userId,
      connectionId
    };

    await sendSQSMessage(sqsEvent);

    return httpResponse({});
  } catch (e) {
    console.log(e);
    return httpResponse('Something went wrong', 500);
  }
};
