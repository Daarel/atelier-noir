import { useEffect } from 'react';

import { useThemeStore } from '@/stores/store';

export const useThemeSync = () => {
  const theme = useThemeStore((state) => state.theme);
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = () => {
      root.classList.remove('light', 'dark');
      if (theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.add(isDark ? 'dark' : 'light');
      } else {
        root.classList.add(theme);
      }
    };
    applyTheme();
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [theme]);
};
