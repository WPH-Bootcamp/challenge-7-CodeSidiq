// src/lib/store.ts
import { configureStore } from '@reduxjs/toolkit';

import { filtersReducer } from '@/features/filters/filtersSlice';

const noopReducer = (state = {}) => state;

export const store = configureStore({
  reducer: {
    // keep noop kalau kamu butuh placeholder
    __noop: noopReducer,

    // Session E
    filters: filtersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
