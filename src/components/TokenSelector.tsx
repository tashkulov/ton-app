import { useState } from 'react';
import type { Token } from '../constants/tokens';
import { TESTNET_TOKENS } from '../constants/tokens';

interface TokenSelectorProps {
  selectedToken: Token | null;
  onSelect: (token: Token) => void;
  excludeToken?: Token | null;
  label: string;
}

export const TokenSelector = ({
  selectedToken,
  onSelect,
  excludeToken,
  label,
}: TokenSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const availableTokens = TESTNET_TOKENS.filter(
    token => token.address !== excludeToken?.address
  );

  const handleSelect = (token: Token) => {
    onSelect(token);
    setIsOpen(false);
  };

  return (
    <div className="token-selector">
      <label className="token-label">{label}</label>
      <button
        type="button"
        className="token-select-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedToken ? (
          <div className="token-display">
            <span className="token-symbol">{selectedToken.symbol}</span>
            <span className="token-name">{selectedToken.name}</span>
          </div>
        ) : (
          <span>Select token</span>
        )}
        <span className="arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="token-dropdown">
          {availableTokens.map(token => (
            <button
              key={token.address}
              type="button"
              className={`token-option ${
                selectedToken?.address === token.address ? 'selected' : ''
              }`}
              onClick={() => handleSelect(token)}
            >
              <span className="token-symbol">{token.symbol}</span>
              <span className="token-name">{token.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
