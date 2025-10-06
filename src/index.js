import React from 'react';
import { createRoot } from 'react-dom/client';
import PixelBoard from './components/PixelBoard/PixelBoard';
import { AppKitProvider } from './librairies/appKit';
import ConnectButton from './components/ConnectButton';

const App = () => (

    <AppKitProvider>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20 }}>
            <h1>On-Chain Pixel War</h1>
            <ConnectButton />
            <PixelBoard />
        </div>
    </AppKitProvider>
);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

