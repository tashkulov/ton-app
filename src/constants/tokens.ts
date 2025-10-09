// constants/tokens.ts
export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  image?: string;
}

export const TON_PSEUDO = 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c';

export const MAINNET_TOKENS: Token[] = [
  { symbol: 'TON', name: 'Toncoin', address: TON_PSEUDO, decimals: 9 },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
    decimals: 6,
  },
  {
    symbol: 'STON',
    name: 'STON Token',
    address: 'EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO',
    decimals: 9,
  },
];

export const TOKENS = MAINNET_TOKENS;

export const getTokenByAddress = (addr: string) =>
  TOKENS.find(t => t.address === addr);
export const getTokenBySymbol = (sym: string) =>
  TOKENS.find(t => t.symbol.toUpperCase() === sym.toUpperCase());
