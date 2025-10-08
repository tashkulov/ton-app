export const tonConnectConfig = {
  manifestUrl:
    import.meta.env.VITE_MANIFEST_URL ||
    'https://raw.githubusercontent.com/ton-community/ton-connect/main/manifest.json',
  network: import.meta.env.VITE_NETWORK || 'testnet',
};
