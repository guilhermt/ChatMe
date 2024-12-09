import {
  AuthenticationDetails,
  CognitoRefreshToken,
  CognitoUser,
  CognitoUserPool,
} from 'amazon-cognito-identity-js';
import { Authentication } from './types';
import { api } from '../api';

const userpool = import.meta.env.VITE_USERPOOL_ID;
const client = import.meta.env.VITE_USERPOOL_CLIENT_ID;

const userPool = new CognitoUserPool({
  UserPoolId: userpool,
  ClientId: client,
});

const signIn = ({
  email,
  password,
}: Authentication.SignInInput): Promise<Authentication.SignInOutput> =>
  new Promise((res, rej) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const cognitoUser = new CognitoUser({
      Pool: userPool,
      Username: email,
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        const authObj = {
          accessToken: result.getAccessToken().getJwtToken(),
          idToken: result.getIdToken().getJwtToken(),
          refreshToken: result.getRefreshToken().getToken(),
        };

        res(authObj);
      },
      onFailure: rej,
    });
  });

const getUser = async (): Promise<Authentication.GetUserOutput> => {
  const res = await api.get<Authentication.GetUserOutput>('/users/me');

  return res.data;
};

const refreshTokens = ({
  refreshToken,
  email,
}: Authentication.RefreshTokensInput): Promise<Authentication.RefreshTokensOutput> =>
  new Promise((res, rej) => {
    const cognitoUser = new CognitoUser({
      Pool: userPool,
      Username: email,
    });

    const refreshTokenObj = new CognitoRefreshToken({ RefreshToken: refreshToken });

    cognitoUser.refreshSession(refreshTokenObj, (err, session) => {
      if (err) {
        rej(err);
      } else {
        const authObj = {
          newAccessToken: session.getAccessToken().getJwtToken(),
          newIdToken: session.getIdToken().getJwtToken(),
          newRefreshToken: session.getRefreshToken().getToken(),
        };

        res(authObj);
      }
    });
  });

const requestNewPassword = ({ email }: Authentication.NewPasswordInput): Promise<void> =>
  new Promise((res, rej) => {
    const cognitoUser = new CognitoUser({
      Pool: userPool,
      Username: email,
    });

    cognitoUser.forgotPassword({
      onSuccess: () => {
        res();
      },
      onFailure: rej,
    });
  });

const sendNewPassword = ({
  email,
  code,
  newPassword,
}: Authentication.ResetPasswordProps): Promise<void> => {
  const cognitoUser = new CognitoUser({
    Username: email,
    Pool: userPool,
  });

  return new Promise((res, rej) => {
    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess: () => res(),
      onFailure: rej,
    });
  });
};

const signUp = async (data: Authentication.SignUpInput) => {
  await api.post('sign-up', data);
};

export const authentication = {
  signIn,
  getUser,
  refreshTokens,
  requestNewPassword,
  sendNewPassword,
  signUp,
};
