import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { openConnectModal } from '../librairies/appKit';

export default function ConnectButton() {
  const { isConnected } = useAccount();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasElements = () =>
      !!customElements.get('appkit-button') &&
      !!customElements.get('appkit-account-button') &&
      !!customElements.get('appkit-network-button');

    if (hasElements()) {
      setReady(true);
      return;
    }

    const intervalId = setInterval(() => {
      if (hasElements()) {
        setReady(true);
        clearInterval(intervalId);
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, []);

  if (!ready) {
    return (
      <button
        onClick={() => openConnectModal()}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          height: 40,
          padding: '0 16px',
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 600,
          border: 'none',
          cursor: 'pointer',
          color: '#ffffff',
          background: 'linear-gradient(90deg, #4e54c8, #8f94fb)',
          transition: '0.2s',
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = 'linear-gradient(90deg, #3b3fc1, #7f83f5)')
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = 'linear-gradient(90deg, #4e54c8, #8f94fb)')
        }
        aria-label={isConnected ? 'Account' : 'Connect Wallet'}
        title={isConnected ? 'Account' : 'Connect Wallet'}
      >
        {isConnected ? 'Account' : 'Connect Wallet'}
      </button>
    );
  }

  if (isConnected) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <appkit-network-button />
        <appkit-account-button />
      </span>
    );
  }

  return <appkit-button />;
}
