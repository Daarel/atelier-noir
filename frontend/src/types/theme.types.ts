export type Theme = 'light' | 'dark' | 'system';

export interface ThemeState {
  theme: Theme;
}

export interface ThemeActions {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export type ThemeSlice = ThemeState & ThemeActions;
