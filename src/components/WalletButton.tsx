import { useEffect } from 'react';
import {
  useTonConnectUI,
  useTonAddress,
  useTonWallet,
} from '@tonconnect/ui-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setConnected,
  setDisconnected,
  setConnecting,
} from '../store/slices/walletSlice';
import { formatAddress, formatBalance } from '../utils/format';

export const WalletButton = () => {
  const [tonConnectUI] = useTonConnectUI();
  const address = useTonAddress();
  const wallet = useTonWallet();
  const dispatch = useAppDispatch();
  const { isConnected, balance, isConnecting } = useAppSelector(
    state => state.wallet
  );

  useEffect(() => {
    const fetchBalanceIfNeeded = async () => {
      if (wallet && address) {
        await fetchBalance(address);
      } else if (!wallet) {
        dispatch(setDisconnected());
      }
    };

    fetchBalanceIfNeeded();
  }, [wallet, address]);

  const fetchBalance = async (walletAddress: string) => {
    try {
      const response = await fetch(
        `https://testnet.tonapi.io/v2/accounts/${walletAddress}`
      );
      const data = await response.json();
      const balanceInTon = (data.balance / 1_000_000_000).toString();

      dispatch(
        setConnected({
          address: walletAddress,
          balance: balanceInTon,
        })
      );
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      dispatch(
        setConnected({
          address: walletAddress,
          balance: '0',
        })
      );
    }
  };

  const handleConnect = async () => {
    try {
      dispatch(setConnecting());
      await tonConnectUI.openModal();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await tonConnectUI.disconnect();
      dispatch(setDisconnected());
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  if (isConnected && address) {
    return (
      <div className="wallet-info">
        <div className="wallet-details">
          <span className="wallet-address">{formatAddress(address)}</span>
          <span className="wallet-balance">
            {formatBalance(balance || '0')} TON
          </span>
        </div>
        <button onClick={handleDisconnect} className="btn btn-secondary">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="btn btn-primary"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
};
