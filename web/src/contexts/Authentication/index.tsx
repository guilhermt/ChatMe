import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { showNotification } from '@mantine/notifications';
import { services } from '@/services';
import { ContextData } from '@/@types/common';
import { showErrorNotification } from '@/utils/showErrorNotification';
import { Models } from '@/@types/models';

/* ---------- Interfaces ---------- */
interface AuthContextData {
  user: User;
  handleSignIn: (props: HandleSignInProps) => Promise<void>;
  handleLogout: () => void;
  handleRequestNewPassword: (props: RequestNewPasswordProps) => Promise<void>;
  handleSendNewPassword: (props: SendNewPasswordProps) => Promise<void>;
  handleSignUp: (props: HandleSignUpProps) => Promise<void>;
  handleUpdateUserProfile: (props: UpdateUserProfileProps) => Promise<void>
}

interface HandleSignInProps {
  email: string;
  password: string;
}

interface HandleSignUpProps {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface RequestNewPasswordProps {
  email: string;
}

interface SendNewPasswordProps {
  email: string;
  code: string;
  newPassword: string;
}

interface UpdateUserProfileProps {
  name: string;
  profilePicture: File | null
}

interface Props {
  children: React.ReactNode;
}

type User = ContextData<Models.User | null>;

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [cookies, setCookie, removeCookie] = useCookies(['idToken', 'accessToken', 'refreshToken']);

  const navigate = useNavigate();

  const location = useLocation();

  const hasLoaded = useRef(false);

  const [user, setUser] = useState<User>({
    data: null,
    isLoading: false,
  });

  const handleRefreshToken = useCallback(async () => {
    const { idToken, accessToken, refreshToken } = cookies;

    if (!accessToken || !refreshToken) return;

    const token = jwtDecode(accessToken);

    const id = jwtDecode(idToken) as { email: string };

    const email = id?.email;

    if (!token.exp || !email) return;

    const expiration = token.exp * 1000;

    const now = Date.now();

    const diffInHours = (expiration - now) / 1000 / 60 / 60;

    if (diffInHours < 0) return;

    if (diffInHours < 20) {
      const res = await services.authentication.refreshTokens({ email, refreshToken });

      const { newIdToken, newAccessToken, newRefreshToken } = res;

      setCookie('idToken', newIdToken, { path: '/' });
      setCookie('accessToken', newAccessToken, { path: '/' });
      setCookie('refreshToken', newRefreshToken, { path: '/' });
    }
  }, [cookies]);

  const loadContextData = useCallback(async () => {
    if (user.isLoading || hasLoaded.current === true) return;

    setUser((p) => ({
      ...p,
      isLoading: true,
    }));

    try {
      const userData = await services.authentication.getUser();

      setUser({ data: userData, isLoading: false });

      handleRefreshToken();
    } catch (e) {
      console.log(e);
    }

    setUser((p) => ({
      ...p,
      isLoading: false,
    }));

    hasLoaded.current = true;
  }, [setUser, hasLoaded, user.isLoading, handleRefreshToken]);

  const handleCognitoError = (error: Error) => {
    const defaultMessage = 'Algo deu errado. Por favor, tente novamente';

    const cognitoErrors = [
      'User does not exist.',
      'Incorrect username or password.',
      'Username/client id combination not found.',
    ];

    const newCognitoErrors = [
      'O usuário não existe',
      'Senha ou usuário incorretos',
      'O usuário não existe',
    ];

    const errorIndex = cognitoErrors.findIndex((item) => item === error.message);

    const newMessage = newCognitoErrors[errorIndex];

    // eslint-disable-next-line no-param-reassign
    error.message = newMessage ?? defaultMessage;

    throw error;
  };

  const handleSignIn = useCallback(
    async ({ email, password }: HandleSignInProps) => {
      try {
        const data = await services.authentication.signIn({
          email,
          password,
        });

        const { idToken, accessToken, refreshToken } = data;

        setCookie('idToken', idToken);
        setCookie('accessToken', accessToken);
        setCookie('refreshToken', refreshToken);

        setUser({ data: null, isLoading: false });

        hasLoaded.current = false;
      } catch (e) {
        handleCognitoError(e as Error);
      }
    },
    [setCookie]
  );

  const handleSignUp = useCallback(
    async ({ name, email, phone, password }: HandleSignUpProps) => {
      try {
        await services.authentication.signUp({ name, email, phone, password });

        handleSignIn({ email, password });
      } catch (e) {
        showNotification({
          title: 'Algo deu errado',
          message: 'Houve um problema. Por favor, tente novamente ou entre em contato',
          color: 'red',
        });
      }
    },
    [handleSignIn]
  );

  const handleRequestNewPassword = useCallback(async ({ email }: RequestNewPasswordProps) => {
    try {
      await services.authentication.requestNewPassword({
        email,
      });
    } catch (e) {
      handleCognitoError(e as Error);
    }
  }, []);

  const handleSendNewPassword = useCallback(
    async ({ email, code, newPassword }: SendNewPasswordProps) => {
      try {
        await services.authentication.sendNewPassword({
          email,
          code,
          newPassword,
        });

        showNotification({
          title: 'Senha alterada',
          message: 'Faça login utilizando a sua nova senha',
          color: 'green',
        });
      } catch (e) {
        showErrorNotification();
        throw e;
      }
    },
    []
  );

  const handleUpdateUserProfile = useCallback(
    async ({ name, profilePicture }: UpdateUserProfileProps) => {
      try {
        const { user } = await services.authentication.updateUser({ name, profilePicture });

        setUser({
          data: user,
          isLoading: false,
        });

        showNotification({
          title: 'Perfil Atualizado',
          message: 'Seus contatos verão seu novo perfil',
          color: 'green',
        });
      } catch (e) {
        console.log(e);
        showErrorNotification();
      }
    },
    []
  );

  const handleLogout = useCallback(() => {
    setUser({ data: null, isLoading: false });

    hasLoaded.current = false;

    removeCookie('idToken');
    removeCookie('accessToken');
    removeCookie('refreshToken');
  }, [removeCookie]);

  const handleRedirect = useCallback(async () => {
    const { idToken, accessToken, refreshToken } = cookies;

    const allTokens = [idToken, accessToken, refreshToken].every(Boolean);

    const onAuthPage = ['/sign-in', '/sign-up'].includes(location.pathname);

    if (!hasLoaded.current && allTokens) {
      loadContextData();
    }

    const shouldLogin = !allTokens && !onAuthPage;

    const shouldGoToHome = allTokens && onAuthPage;

    if (shouldLogin) {
      navigate('/sign-in');
    }

    if (shouldGoToHome) {
      navigate('/');
    }
  }, [user.data, cookies, navigate, location.pathname]);

  useEffect(() => {
    handleRedirect();
  }, [handleRedirect]);

  /* ---------- Memos ---------- */
  const value = useMemo(
    () => ({
      user,
      handleSignIn,
      handleLogout,
      handleRequestNewPassword,
      handleSendNewPassword,
      handleUpdateUserProfile,
      handleSignUp,
    }),
    [
      user,
      handleSignIn,
      handleLogout,
      handleRequestNewPassword,
      handleSendNewPassword,
      handleUpdateUserProfile,
      handleSignUp,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('Error inside of useAuth');
  }

  return context;
};
