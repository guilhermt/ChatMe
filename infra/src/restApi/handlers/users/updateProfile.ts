import { type APIGatewayEvent } from 'aws-lambda';
import { httpResponse } from '../../../utils/requests/httpResponse';
import { authorizer } from '../../../utils/requests/authorizer';
import { parseMultipartRequest } from '../../../utils/requests/parseMultipart';
import { type ParsedFile } from '../../../utils/requests/parseMultipartBody';
import { uploadProfilePicture } from '../../../utils/s3/uploadImage';
import { type Models } from '../../../@types/models';
import { createUpdateObject } from '../../../utils/dynamo/createUpdateObject';
import { updateDynamoItem } from '../../../utils/dynamo/editItem';

interface UpdateUserBody {
  name: string;
  profilePicture?: ParsedFile
}

export const handler = async (event: APIGatewayEvent) => {
  try {
    const authResponse = await authorizer(event);

    if (!('user' in authResponse)) {
      return authResponse;
    }

    const { user } = authResponse;

    const body = await parseMultipartRequest(event);

    const { name, profilePicture } = body as UpdateUserBody;

    if (!name) return httpResponse('User name is required', 400);

    const profilePictureUrl = await uploadProfilePicture({
      userId: user.id,
      profilePicture
    });

    const userUpdateProps = {
      name,
      profilePicture: profilePictureUrl ?? user.profilePicture
    } as Models.User;

    const userUpdate = createUpdateObject(userUpdateProps);

    const userKeys = {
      pk: user.pk,
      sk: user.sk
    };

    await updateDynamoItem(userKeys, userUpdate);

    const updatedUser = {
      ...user,
      ...userUpdateProps
    };

    return httpResponse({ user: updatedUser });
  } catch (e) {
    console.log(e);
    return httpResponse('Something went wrong', 500);
  }
};
