export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export const formatBalance = (balance: string | number): string => {
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  if (isNaN(num)) return '0';
  return num.toFixed(4);
};

export const formatAmount = (amount: string, decimals: number = 9): bigint => {
  try {
    const [integer, fraction = ''] = amount.split('.');
    const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
    return BigInt(integer + paddedFraction);
  } catch {
    return BigInt(0);
  }
};

export const fromNano = (
  amount: bigint | string,
  decimals: number = 9
): string => {
  try {
    const amountStr = amount.toString();
    const paddedAmount = amountStr.padStart(decimals + 1, '0');
    const integer = paddedAmount.slice(0, -decimals) || '0';
    const fraction = paddedAmount.slice(-decimals);
    return `${integer}.${fraction}`.replace(/\.?0+$/, '');
  } catch {
    return '0';
  }
};
