import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { MainPage } from './pages/Main';
import { SignInPage } from './pages/SignIn';
import AppProvider from './contexts';
import { NotFoundPage } from './pages/404';
import { SignUpPage } from './pages/SignUp';

const router = createBrowserRouter([
  {
    element: (
      <AppProvider>
        <Outlet />
      </AppProvider>
    ),
    children: [
      {
        path: '/sign-in',
        element: <SignInPage />,
      },
      {
        path: '/sign-up',
        element: <SignUpPage />,
      },
      {
        path: '/',
        element: <MainPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
