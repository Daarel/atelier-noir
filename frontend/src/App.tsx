import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';

import { useThemeSync } from '@/hooks/useThemeSync';
import { router } from '@/routes';

export default function App() {
  useThemeSync();

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" richColors />
    </>
  );
}
