import { createBrowserRouter } from 'react-router-dom';

import RootLayout from '@/components/layouts/RootLayout';
import Login from '@/pages/auth/Login';
import ResetPassword from '@/pages/auth/ResetPassword';
import Signup from '@/pages/auth/Signup';
import Home from '@/pages/Home';
import NotFound from '@/pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'signup',
        element: <Signup />,
      },
      {
        path: 'reset-password',
        element: <ResetPassword />,
      },
    ],
  },
]);
