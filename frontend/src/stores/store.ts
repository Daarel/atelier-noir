import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createThemeSlice } from '@/stores/slices/theme-slice';
import type { Store } from '@/types/store';

export const useThemeStore = create<Store>()(
  devtools(
    persist(
      immer((...a) => ({ ...createThemeSlice(...a) })),
      { name: 'atelier-theme-storage' },
    ),
  ),
);
