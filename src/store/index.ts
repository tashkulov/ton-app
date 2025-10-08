import { configureStore } from '@reduxjs/toolkit';
import walletReducer from './slices/walletSlice';
import swapReducer from './slices/swapSlice';

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    swap: swapReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
