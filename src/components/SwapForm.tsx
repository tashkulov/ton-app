import { useState, useEffect } from 'react';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setFromToken,
  setToToken,
  setFromAmount,
  setToAmount,
  setSlippage,
  setRate,
  swapTokens as swapTokensAction,
  setLoading,
  setSuccess,
  setError,
  resetSwap,
} from '../store/slices/swapSlice';
import { TokenSelector } from './TokenSelector';
import { MAINNET_TOKENS as TOKENS } from '../constants/tokens';
import { formatAmount, fromNano } from '../utils/format';
import {
  estimateSwap,
  buildSwapTransaction,
  getWalletExplorerUrl,
  pollLatestTxUrl,
} from '../services/stonfi';

export const SwapForm = () => {
  const [tonConnectUI] = useTonConnectUI();
  const address = useTonAddress();
  const dispatch = useAppDispatch();

  const {
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    slippage,
    isLoading,
    error,
    txHash,
    rate,
  } = useAppSelector(state => state.swap);
  const { isConnected } = useAppSelector(state => state.wallet);

  const [estimating, setEstimating] = useState(false);

  useEffect(() => {
    if (!fromToken) dispatch(setFromToken(TOKENS[0]));
    if (!toToken) dispatch(setToToken(TOKENS[1]));
  }, []);

  useEffect(() => {
    if (fromAmount && fromToken && toToken && parseFloat(fromAmount) > 0) {
      estimateSwapAmount();
    } else {
      dispatch(setToAmount(''));
      dispatch(setRate(null));
    }
  }, [fromAmount, fromToken, toToken]);

  const estimateSwapAmount = async () => {
    if (!fromAmount || !fromToken || !toToken || !address) return;
    try {
      setEstimating(true);

      const amountInNano = formatAmount(fromAmount, fromToken.decimals);

      const estimate = await estimateSwap({
        fromToken: fromToken.address,
        toToken: toToken.address,
        amount: amountInNano,
        slippage,
        userAddress: address,
      });

      const outputAmount = fromNano(
        BigInt(estimate.expectedOutput),
        toToken.decimals
      );

      dispatch(setToAmount(outputAmount));
      dispatch(setRate(estimate.exchangeRate));
    } catch (err) {
      console.error('Estimation failed:', err);
      dispatch(setToAmount(''));
      dispatch(setRate(null));
    } finally {
      setEstimating(false);
    }
  };

  const handleSwap = async () => {
    if (!isConnected || !address) {
      dispatch(setError('Please connect your wallet first'));
      return;
    }
    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) {
      dispatch(setError('Please fill in all fields'));
      return;
    }
    if (!toAmount || parseFloat(toAmount) <= 0) {
      dispatch(setError('Cannot estimate swap output. Try again.'));
      return;
    }

    try {
      dispatch(setLoading(true));

      const amountInNano = formatAmount(fromAmount, fromToken.decimals);

      const transaction = await buildSwapTransaction({
        fromToken: fromToken.address,
        toToken: toToken.address,
        amount: amountInNano,
        slippage,
        userAddress: address,
      });

      const result = await tonConnectUI.sendTransaction(transaction);
      console.log('Transaction sent:', result);

      // mainnet: больше не передаём isTestnet
      let explorerUrl = getWalletExplorerUrl(address);
      try {
        const polledUrl = await pollLatestTxUrl(address);
        if (polledUrl) explorerUrl = polledUrl;
      } catch (error) {
        console.log(error);
      }

      dispatch(setSuccess(explorerUrl));
    } catch (err: unknown) {
      console.error('Swap failed:', err);
      let errorMessage = 'Swap failed. Please try again.';

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = String((err as any).message);
      }

      if (/reject|cancel|denied/i.test(errorMessage)) {
        errorMessage = 'Transaction rejected by user';
      }

      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSwapTokens = () => {
    dispatch(swapTokensAction());
  };

  const isSwapDisabled =
    !isConnected ||
    isLoading ||
    estimating ||
    !fromToken ||
    !toToken ||
    !fromAmount ||
    parseFloat(fromAmount) <= 0;

  return (
    <div className="swap-form">
      <div className="swap-header">
        <h2>Swap Tokens</h2>
        <div className="slippage-control">
          <label>Slippage: </label>
          <select
            value={slippage}
            onChange={e => dispatch(setSlippage(parseFloat(e.target.value)))}
            className="slippage-select"
          >
            <option value={0.5}>0.5%</option>
            <option value={1}>1%</option>
            <option value={2}>2%</option>
            <option value={5}>5%</option>
          </select>
        </div>
      </div>

      <div className="swap-inputs">
        <div className="input-group">
          <TokenSelector
            label="From"
            selectedToken={fromToken}
            onSelect={token => dispatch(setFromToken(token))}
            excludeToken={toToken}
          />
          <input
            type="number"
            placeholder="0.0"
            value={fromAmount}
            onChange={e => dispatch(setFromAmount(e.target.value))}
            className="amount-input"
            disabled={isLoading}
          />
        </div>

        <button
          type="button"
          className="swap-direction-btn"
          onClick={handleSwapTokens}
          disabled={isLoading}
        >
          ⇅
        </button>

        <div className="input-group">
          <TokenSelector
            label="To"
            selectedToken={toToken}
            onSelect={token => dispatch(setToToken(token))}
            excludeToken={fromToken}
          />
          <input
            type="number"
            placeholder="0.0"
            value={toAmount}
            readOnly
            className="amount-input"
            disabled={isLoading}
          />
        </div>
      </div>

      {rate && toAmount && (
        <div className="swap-info">
          <div className="swap-rate">
            <span className="label">Exchange Rate:</span>
            <span className="value">
              1 {fromToken?.symbol} ≈ {parseFloat(rate).toFixed(6)}{' '}
              {toToken?.symbol}
            </span>
          </div>
          <div className="swap-detail">
            <span className="label">Slippage Tolerance:</span>
            <span className="value">{slippage}%</span>
          </div>
          <div className="swap-detail">
            <span className="label">Minimum Received:</span>
            <span className="value">
              {(
                parseFloat(toAmount) -
                (parseFloat(toAmount) * slippage) / 100
              ).toFixed(6)}{' '}
              {toToken?.symbol}
            </span>
          </div>
          {estimating && (
            <div className="estimating-hint">
              <span>⏳ Calculating best route...</span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="error-message">
          <span>❌ {error}</span>
          <button onClick={() => dispatch(resetSwap())} className="btn-clear">
            Clear
          </button>
        </div>
      )}

      {txHash && (
        <div className="success-message">
          <div className="success-content">
            <span className="success-title">✅ Swap transaction sent!</span>
            <span className="success-hint">
              Transaction is being processed on the blockchain
            </span>
          </div>
          <a
            href={txHash}
            target="_blank"
            rel="noopener noreferrer"
            className="explorer-link"
          >
            View in Explorer →
          </a>
          <button onClick={() => dispatch(resetSwap())} className="btn-clear">
            New Swap
          </button>
        </div>
      )}

      <button
        onClick={handleSwap}
        disabled={isSwapDisabled}
        className="btn btn-primary swap-btn"
      >
        {isLoading ? 'Swapping...' : estimating ? 'Estimating...' : 'Swap'}
      </button>

      {!isConnected && (
        <p className="connect-hint">Connect your wallet to start swapping</p>
      )}
    </div>
  );
};
