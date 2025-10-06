import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { baseSepolia } from '@reown/appkit/networks';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const projectId = process.env.REACT_APP_REOWN_PROJECT_ID;
const siteUrl = 'http://localhost:3000'

const caipNetworks = [baseSepolia];

let _appKit = null;
let _wagmiAdapter = null;
let _queryClient = null;

export function initAppKitClient() {
  if (typeof window === 'undefined') return null;
  if (_appKit && _wagmiAdapter) return _appKit;

  _wagmiAdapter = new WagmiAdapter({
    projectId,
    networks: caipNetworks,
    ssr: false,
  });

  _appKit = createAppKit({
    adapters: [_wagmiAdapter],
    projectId,
    networks: caipNetworks,
    metadata: {
      name: 'On-Chain Pixel War',
      description: 'A simple pixel art dApp where every pixel is stored on-chain.',
      url: siteUrl,
    },
  });

  if (!_queryClient) _queryClient = new QueryClient();
  return _appKit;
}

export function getAppKit() {
  if (typeof window === 'undefined') return null;
  return initAppKitClient();
}

export function openConnectModal() {
  if (!_appKit) initAppKitClient();
  return _appKit?.modal?.openConnectModal?.();
}

export function AppKitProvider({ children }) {
  const [{ ready, wagmiConfig }, setState] = React.useState({
    ready: false,
    wagmiConfig: null,
  });

  React.useEffect(() => {
    const app = initAppKitClient();
    if (_wagmiAdapter?.wagmiConfig) {
      setState({ ready: true, wagmiConfig: _wagmiAdapter.wagmiConfig });
    }
  }, []);

  if (!ready || !wagmiConfig) return null;

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={_queryClient || new QueryClient()}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export const appKit = (typeof window !== 'undefined' ? getAppKit() : null);
