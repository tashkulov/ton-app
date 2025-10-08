export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  image?: string;
}

// STON.fi Testnet tokens
export const TESTNET_TOKENS: Token[] = [
  {
    symbol: 'TON',
    name: 'Toncoin',
    address: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c', // Native TON
    decimals: 9,
  },
  {
    symbol: 'jUSDT',
    name: 'Testnet jUSDT',
    address: 'EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA',
    decimals: 6,
  },
  {
    symbol: 'jUSDC',
    name: 'Testnet jUSDC',
    address: 'EQB-MPwrd1G6WKNkLz_VnV6WqBDd142KMQv-g1O-8QUA3728',
    decimals: 6,
  },
  {
    symbol: 'STON',
    name: 'STON Token',
    address: 'EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO',
    decimals: 9,
  },
];

export const getTokenByAddress = (address: string): Token | undefined => {
  return TESTNET_TOKENS.find(token => token.address === address);
};

export const getTokenBySymbol = (symbol: string): Token | undefined => {
  return TESTNET_TOKENS.find(token => token.symbol === symbol);
};
