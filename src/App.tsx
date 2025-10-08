import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { Provider } from 'react-redux';
import { store } from './store';
import { WalletButton } from './components/WalletButton';
import { SwapForm } from './components/SwapForm';
import './App.css';

function App() {
  const manifestUrl =
    'https://ton-connect.github.io/demo-dapp-with-wallet/tonconnect-manifest.json';

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <Provider store={store}>
        <div className="app">
          <header className="app-header">
            <div className="header-content">
              <div className="logo">
                <h1>TON Swap</h1>
                <span className="testnet-badge">TESTNET</span>
              </div>
              <WalletButton />
            </div>
          </header>

          <main className="app-main">
            <div className="swap-container">
              <SwapForm />
            </div>
          </main>

          <footer className="app-footer">
            <p>
              Powered by{' '}
              <a
                href="https://ston.fi"
                target="_blank"
                rel="noopener noreferrer"
              >
                STON.fi
              </a>{' '}
              on TON Testnet
            </p>
          </footer>
        </div>
      </Provider>
    </TonConnectUIProvider>
  );
}

export default App;
