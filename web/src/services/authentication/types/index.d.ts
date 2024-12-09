import { TUser } from '@/contexts/Authentication';

export namespace Authentication {
  interface SignInInput {
    email: string;
    password: string;
  }

  interface SignInOutput {
    accessToken: string;
    idToken: string;
    refreshToken: string;
  }

  type GetUserOutput = TUser;

  interface RefreshTokensInput {
    email: string;
    refreshToken: string;
  }

  interface NewPasswordInput {
    email: string;
  }

  interface RefreshTokensOutput {
    newAccessToken: string;
    newIdToken: string;
    newRefreshToken: string;
  }

  interface ResetPasswordProps {
    email: string;
    code: string;
    newPassword: string;
  }

  interface SignUpInput {
    name: string;
    email: string;
    phone: string;
    password: string;
  }
}
