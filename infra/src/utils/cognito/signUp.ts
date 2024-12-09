import { client } from '../../clients/cognito';
import {
  type AdminCreateUserCommandInput,
  AdminCreateUserCommand,
  type AdminSetUserPasswordCommandInput,
  AdminSetUserPasswordCommand
} from '@aws-sdk/client-cognito-identity-provider';

interface Props {
  email: string;
  password: string;
}

const UserPoolId = process.env.USERPOOL_ID ?? '';

export const createCognitoAccount = async ({
  email,
  password
}: Props) => {
  const createUserParams: AdminCreateUserCommandInput = {
    Username: email,
    TemporaryPassword: password,
    UserPoolId,
    MessageAction: 'SUPPRESS',
    UserAttributes: [
      {
        Name: 'email',
        Value: email
      },
      {
        Name: 'email_verified',
        Value: 'true'
      }
    ]
  };

  const createUserCommand = new AdminCreateUserCommand(createUserParams);

  const createUserResponse = await client.send(createUserCommand);

  const setPasswordParams: AdminSetUserPasswordCommandInput = {
    Username: email,
    Password: password,
    UserPoolId,
    Permanent: true
  };

  const setPasswordCommand = new AdminSetUserPasswordCommand(setPasswordParams);

  await client.send(setPasswordCommand);

  const userId = createUserResponse.User?.Username ?? '';

  return userId;
};
