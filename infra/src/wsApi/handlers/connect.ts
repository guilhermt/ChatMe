import { type APIGatewayProxyEvent } from 'aws-lambda';
import { httpResponse } from '../../utils/requests/httpResponse';
import { authorizer } from '../../utils/requests/authorizer';
import { connectUser } from '../../utils/ws/connectUser';
import { sendSQSMessage, type SQSSourceEvent } from '../../utils/sqs/sendMessage';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const authResponse = await authorizer(event);

    if (!('user' in authResponse)) {
      return authResponse;
    }

    const userId = authResponse.user.id;

    const connectionId = event.requestContext.connectionId!;

    await connectUser({ connectionId, userId });

    const sqsEvent: SQSSourceEvent = {
      type: 'connect',
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
