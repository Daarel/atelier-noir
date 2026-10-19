import type { StateCreator } from 'zustand';

import { INITIAL_THEME_STATE } from '@/constants';
import type { Store } from '@/types/store.types';
import type { ThemeSlice } from '@/types/theme.types';

export type { ThemeSlice };

export const createThemeSlice: StateCreator<Store, [['zustand/immer', never]], [], ThemeSlice> = (
  set,
) => ({
  ...INITIAL_THEME_STATE,
  setTheme: (theme) =>
    set((state) => {
      state.theme = theme;
    }),
  toggleTheme: () =>
    set((state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    }),
});
