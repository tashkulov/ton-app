import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface WalletState {
  address: string | null;
  balance: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

const initialState: WalletState = {
  address: null,
  balance: null,
  isConnected: false,
  isConnecting: false,
  error: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setConnecting: state => {
      state.isConnecting = true;
      state.error = null;
    },
    setConnected: (
      state,
      action: PayloadAction<{ address: string; balance: string }>
    ) => {
      state.address = action.payload.address;
      state.balance = action.payload.balance;
      state.isConnected = true;
      state.isConnecting = false;
      state.error = null;
    },
    setBalance: (state, action: PayloadAction<string>) => {
      state.balance = action.payload;
    },
    setDisconnected: state => {
      state.address = null;
      state.balance = null;
      state.isConnected = false;
      state.isConnecting = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isConnecting = false;
    },
  },
});

export const {
  setConnecting,
  setConnected,
  setBalance,
  setDisconnected,
  setError,
} = walletSlice.actions;

export default walletSlice.reducer;
