import { Address, beginCell, toNano } from '@ton/core';

const STONFI_ROUTER_ADDRESS =
  import.meta.env.VITE_STONFI_ROUTER ??
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


const STONFI_API = 'https://api.ston.fi';
const TONAPI_BASE = 'https://tonapi.io';

export const getExplorerUrl = (txId: string): string =>
  `https://tonviewer.com/transaction/${txId}`;

export const getWalletExplorerUrl = (address: string): string =>
  `https://tonviewer.com/${address}`;

/** Последний event_id (для прямой ссылки на транзакцию) */
export async function getLatestTxId(address: string): Promise<string | null> {
  try {
    const url = `${TONAPI_BASE}/v2/accounts/${address}/events?limit=1`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const data = (await resp.json()) as any;
    const events = Array.isArray(data?.events) ? data.events : [];
    if (events.length === 0) return null;
    return (events[0]?.event_id as string) || null;
  } catch (e) {
    console.error('getLatestTxId error:', e);
    return null;
  }
}

/** Поллинг TonAPI, чтобы получить свежий event_id после отправки транзы */
export async function pollLatestTxUrl(
  address: string,
  {
    timeoutMs = 12000,
    intervalMs = 1200,
  }: { timeoutMs?: number; intervalMs?: number } = {}
): Promise<string | null> {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const txId = await getLatestTxId(address);
    if (txId) return getExplorerUrl(txId);
    await new Promise(res => setTimeout(res, intervalMs));
  }
  return null;
}

/* ================================
 * STON.fi — примеры вызовов API
 * ================================ */

/** Инфо по пулу (mainnet) */
export const getPoolInfo = async (
  token0: string,
  token1: string
): Promise<Record<string, unknown> | null> => {
  try {
    const url = `${STONFI_API}/v1/pools?token0=${token0}&token1=${token1}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch pool info');
    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    console.error('Failed to get pool info:', error);
    return null;
  }
};

/** Оценка свапа (ПОКА МОК 1:1 — подставь реальный роутинг при необходимости) */
export const estimateSwap = async (
  params: SwapParams
): Promise<SwapEstimate> => {
  try {
    const { amount, slippage } = params;
    const mockRate = 1.0; // 1:1 для демо
    const expected = Number(amount) * mockRate;
    const minOut = expected - (expected * slippage) / 100;

    return {
      expectedOutput: String(expected),
      priceImpact: '0.10',
      exchangeRate: String(mockRate),
      minOutput: String(minOut),
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
    .storeUint(0x25938561, 32)
    .storeAddress(Address.parse(toToken))
    .storeCoins(minOutput)
    .storeAddress(Address.parse(userAddress))
    .endCell();

  return {
    validUntil: Math.floor(Date.now() / 1000) + 600, // 10 минут
    messages: [
      {
        address: STONFI_ROUTER_ADDRESS,
        amount: amount.toString(), // TON для свапа
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
    .storeUint(0x25938561, 32)
    .storeAddress(Address.parse(toToken))
    .storeCoins(minOutput)
    .storeAddress(Address.parse(userAddress))
    .endCell();

  const forwardPayload = beginCell()
    .storeUint(0x0f8a7ea5, 32)
    .storeUint(0, 64)
    .storeCoins(amount)
    .storeAddress(Address.parse(STONFI_ROUTER_ADDRESS))
    .storeAddress(Address.parse(userAddress))
    .storeBit(0)
    .storeCoins(toNano('0.25'))
    .storeBit(1)
    .storeRef(swapPayload)
    .endCell();

  // адрес твоего jetton-wallet для fromToken (mainnet)
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
    validUntil: Math.floor(Date.now() / 1000) + 600,
    messages: [
      {
        address: jettonWalletAddress,
        amount: toNano('0.3').toString(), // газ на transfer + forward
        payload: forwardPayload.toBoc().toString('base64'),
      },
    ],
  };
};

export const parseTransactionHash = (
  result: Record<string, unknown>
): string => {
  try {
    if (result?.boc && typeof (result as any).boc === 'string') {
      return (result as any).boc.slice(0, 32);
    }
    return '';
  } catch (error) {
    console.error('Failed to parse transaction hash:', error);
    return '';
  }
};

async function getUserJettonWalletAddress(
  userAddress: string,
  jettonMasterAddress: string
): Promise<string | null> {
  try {
    const q1 = `${TONAPI_BASE}/v2/jettons/wallets?owner=${userAddress}&jetton=${jettonMasterAddress}`;
    let resp = await fetch(q1);
    if (resp.ok) {
      const data = (await resp.json()) as any;
      const wallets = Array.isArray(data?.wallets) ? data.wallets : [];
      if (wallets.length > 0) {
        const addr = wallets[0]?.address as string | undefined;
        if (addr) return addr;
      }
    }

    const q2 = `${TONAPI_BASE}/v2/accounts/${userAddress}/jettons?limit=200`;
    resp = await fetch(q2);
    if (!resp.ok) return null;
    const data2 = (await resp.json()) as any;
    const balances = Array.isArray(data2?.balances) ? data2.balances : [];
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
