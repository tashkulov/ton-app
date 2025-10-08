import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Token } from '../../constants/tokens';

export interface SwapState {
  fromToken: Token | null;
  toToken: Token | null;
  fromAmount: string;
  toAmount: string;
  slippage: number;
  isLoading: boolean;
  error: string | null;
  txHash: string | null;
  rate: string | null;
}

const initialState: SwapState = {
  fromToken: null,
  toToken: null,
  fromAmount: '',
  toAmount: '',
  slippage: 0.5,
  isLoading: false,
  error: null,
  txHash: null,
  rate: null,
};

const swapSlice = createSlice({
  name: 'swap',
  initialState,
  reducers: {
    setFromToken: (state, action: PayloadAction<Token | null>) => {
      state.fromToken = action.payload;
      state.error = null;
    },
    setToToken: (state, action: PayloadAction<Token | null>) => {
      state.toToken = action.payload;
      state.error = null;
    },
    setFromAmount: (state, action: PayloadAction<string>) => {
      state.fromAmount = action.payload;
      state.error = null;
    },
    setToAmount: (state, action: PayloadAction<string>) => {
      state.toAmount = action.payload;
    },
    setSlippage: (state, action: PayloadAction<number>) => {
      state.slippage = action.payload;
    },
    setRate: (state, action: PayloadAction<string | null>) => {
      state.rate = action.payload;
    },
    swapTokens: state => {
      const tempToken = state.fromToken;
      state.fromToken = state.toToken;
      state.toToken = tempToken;
      state.fromAmount = state.toAmount;
      state.toAmount = '';
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.error = null;
        state.txHash = null;
      }
    },
    setSuccess: (state, action: PayloadAction<string>) => {
      state.txHash = action.payload;
      state.isLoading = false;
      state.error = null;
      state.fromAmount = '';
      state.toAmount = '';
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
      state.txHash = null;
    },
    resetSwap: state => {
      state.fromAmount = '';
      state.toAmount = '';
      state.error = null;
      state.txHash = null;
      state.rate = null;
    },
  },
});

export const {
  setFromToken,
  setToToken,
  setFromAmount,
  setToAmount,
  setSlippage,
  setRate,
  swapTokens,
  setLoading,
  setSuccess,
  setError,
  resetSwap,
} = swapSlice.actions;

export default swapSlice.reducer;
