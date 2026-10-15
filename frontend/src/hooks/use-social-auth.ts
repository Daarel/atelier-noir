import { useState } from 'react';
import { toast } from 'sonner';

import { signIn } from '@/lib/auth-client';

export const useSocialAuth = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loginWithGoogle = async (path = '/') => {
    try {
      setIsLoading(true);

      const callbackURL = path.startsWith('http') ? path : `${window.location.origin}${path}`;

      await signIn.social({
        provider: 'google',
        callbackURL,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error('Gagal menghubungkan ke Google');
      setIsLoading(false);
    }
  };

  return { loginWithGoogle, isLoading };
};
