import { Address, beginCell, toNano } from '@ton/core';

const STONFI_ROUTER_ADDRESS =
  'EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt';

const TON_ADDRESS = 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c';

export interface SwapParams {
  fromToken: string;
  toToken: string;
  amount: bigint;
  slippage: number;
  userAddress: string;
}

export interface SwapEstimate {
  expectedOutput: string;
  priceImpact: string;
  exchangeRate: string;
  minOutput: string;
}

/**
 * Get pool information from STON.fi API
 */
export const getPoolInfo = async (
  token0: string,
  token1: string
): Promise<Record<string, unknown> | null> => {
  try {
    const response = await fetch(
      `https://api.ston.fi/v1/pools?token0=${token0}&token1=${token1}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch pool info');
    }

    const data = (await response.json()) as Record<string, unknown>;
    return data;
  } catch (error) {
    console.error('Failed to get pool info:', error);
    return null;
  }
};

/**
 * Estimate swap output amount
 */
export const estimateSwap = async (
  params: SwapParams
): Promise<SwapEstimate> => {
  try {
    const { amount, slippage } = params;

    const mockRate = 1.0; // 1:1 for simplicity
    const expectedOutput = Number(amount) * mockRate;
    const slippageAmount = (expectedOutput * slippage) / 100;
    const minOutput = expectedOutput - slippageAmount;

    return {
      expectedOutput: expectedOutput.toString(),
      priceImpact: '0.1',
      exchangeRate: mockRate.toString(),
      minOutput: minOutput.toString(),
    };
  } catch (error) {
    console.error('Failed to estimate swap:', error);
    throw new Error('Failed to estimate swap');
  }
};


export const buildSwapTransaction = async (params: SwapParams) => {
  try {
    const { fromToken, toToken, amount, userAddress } = params;

    const estimate = await estimateSwap(params);
    const minOutput = BigInt(estimate.minOutput);

    const isFromTon = fromToken === TON_ADDRESS;

    if (isFromTon) {
      return buildTonToJettonSwap({
        toToken,
        amount,
        minOutput,
        userAddress,
      });
    } else {
      return buildJettonSwap({
        fromToken,
        toToken,
        amount,
        minOutput,
        userAddress,
      });
    }
  } catch (error) {
    console.error('Failed to build swap transaction:', error);
    throw error;
  }
};


const buildTonToJettonSwap = (params: {
  toToken: string;
  amount: bigint;
  minOutput: bigint;
  userAddress: string;
}) => {
  const { toToken, amount, minOutput, userAddress } = params;

  const forwardPayload = beginCell()
    .storeUint(0x25938561, 32) // swap op code
    .storeAddress(Address.parse(toToken)) // ask jetton address
    .storeCoins(minOutput) // min ask amount
    .storeAddress(Address.parse(userAddress)) // receiver address
    .endCell();

  return {
    validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
    messages: [
      {
        address: STONFI_ROUTER_ADDRESS,
        amount: amount.toString(),
        payload: forwardPayload.toBoc().toString('base64'),
      },
    ],
  };
};

const buildJettonSwap = async (params: {
  fromToken: string;
  toToken: string;
  amount: bigint;
  minOutput: bigint;
  userAddress: string;
}) => {
  const { fromToken, toToken, amount, minOutput, userAddress } = params;

  const swapPayload = beginCell()
    .storeUint(0x25938561, 32) // swap op code
    .storeAddress(Address.parse(toToken)) // ask jetton address
    .storeCoins(minOutput) // min ask amount
    .storeAddress(Address.parse(userAddress)) // receiver address
    .endCell();

  const forwardPayload = beginCell()
    .storeUint(0xf8a7ea5, 32) // jetton transfer op code
    .storeUint(0, 64) // query id
    .storeCoins(amount) // amount
    .storeAddress(Address.parse(STONFI_ROUTER_ADDRESS)) // destination
    .storeAddress(Address.parse(userAddress)) // response destination
    .storeBit(0) // no custom payload
    .storeCoins(toNano('0.25')) // forward amount
    .storeBit(1) // forward payload in ref
    .storeRef(swapPayload)
    .endCell();
  // Resolve user's jetton wallet address for the selected jetton master
  const jettonWalletAddress = await getUserJettonWalletAddress(
    userAddress,
    fromToken
  );
  if (!jettonWalletAddress) {
    throw new Error(
      'Jetton wallet not found for selected token. Make sure you hold this jetton.'
    );
  }

  return {
    validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
    messages: [
      {
        address: jettonWalletAddress,
        amount: toNano('0.3').toString(), // Gas fee
        payload: forwardPayload.toBoc().toString('base64'),
      },
    ],
  };
};

/**
 * Parse transaction hash from TON Connect result
 */
export const parseTransactionHash = (
  result: Record<string, unknown>
): string => {
  try {
    if (result?.boc && typeof result.boc === 'string') {
      // For demo, return part of BOC as hash
      // In production, properly parse BOC cell
      return result.boc.slice(0, 32);
    }
    return '';
  } catch (error) {
    console.error('Failed to parse transaction hash:', error);
    return '';
  }
};

/**
 * Get transaction explorer URL
 */
export const getExplorerUrl = (txHash: string, isTestnet = true): string => {
  const network = isTestnet ? 'testnet' : '';
  return `https://${network ? network + '.' : ''}tonviewer.com/transaction/${txHash}`;
};

/**
 * Get wallet explorer URL to view recent transactions
 */
export const getWalletExplorerUrl = (
  address: string,
  isTestnet = true
): string => {
  const network = isTestnet ? 'testnet.' : '';
  return `https://${network}tonviewer.com/${address}`;
};

/**
 * Get the latest transaction id (event_id) for an address using TonAPI.
 * Useful to build a direct explorer link to the specific transaction just sent.
 */
export async function getLatestTxId(address: string, isTestnet = true): Promise<string | null> {
  try {
    const subdomain = isTestnet ? 'testnet.' : '';
    const url = `https://${subdomain}tonapi.io/v2/accounts/${address}/events?limit=1`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const data = (await resp.json()) as Record<string, unknown>;
    const events = Array.isArray((data as any).events) ? (data as any).events : [];
    if (events.length === 0) return null;
    return (events[0]?.event_id as string) || null;
  } catch (e) {
    console.error('getLatestTxId error:', e);
    return null;
  }
}

/**
 * Poll TonAPI for a fresh event id right after sending a tx.
 */
export async function pollLatestTxUrl(
  address: string,
  { isTestnet = true, timeoutMs = 12000, intervalMs = 1200 }: { isTestnet?: boolean; timeoutMs?: number; intervalMs?: number }
): Promise<string | null> {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const txId = await getLatestTxId(address, isTestnet);
    if (txId) {
      const prefix = isTestnet
        ? 'https://testnet.tonviewer.com/transaction/'
        : 'https://tonviewer.com/transaction/';
      return `${prefix}${txId}`;
    }
    await new Promise(res => setTimeout(res, intervalMs));
  }
  return null;
}

/**
 * Resolve user's jetton wallet address for a given jetton master using TonAPI (testnet)
 */
async function getUserJettonWalletAddress(
  userAddress: string,
  jettonMasterAddress: string
): Promise<string | null> {
  try {
    const url = `https://testnet.tonapi.io/v2/accounts/${userAddress}/jettons?limit=200`;
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error('Failed to resolve jetton wallet (TonAPI)');
    }
    const data = (await resp.json()) as Record<string, unknown>;
    const balances = Array.isArray((data as any).balances) ? (data as any).balances : [];
    for (const item of balances) {
      const jetton = item?.jetton;
      if (jetton?.address === jettonMasterAddress) {
        const walletAddr = item?.wallet_address?.address as string | undefined;
        if (walletAddr) return walletAddr;
      }
    }
    return null;
  } catch (e) {
    console.error('getUserJettonWalletAddress error:', e);
    return null;
  }
}
