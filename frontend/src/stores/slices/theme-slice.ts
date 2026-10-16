import type { StateCreator } from 'zustand';

import type { Store } from '@/types/store';

type Theme = 'light' | 'dark' | 'system';

type ThemeState = {
  theme: Theme;
};

type ThemeActions = {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

export type ThemeSlice = ThemeState & ThemeActions;

const initialState: ThemeState = {
  theme: 'light',
};

export const createThemeSlice: StateCreator<Store, [['zustand/immer', never]], [], ThemeSlice> = (
  set,
) => ({
  ...initialState,
  setTheme: (theme) =>
    set((state) => {
      state.theme = theme;
    }),
  toggleTheme: () =>
    set((state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    }),
});
