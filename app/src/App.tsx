import React from 'react';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import StakingDapp from './components/StakingDapp';

require('@solana/wallet-adapter-react-ui/styles.css');

const App = () => {
    // Initialize wallets
    const wallets = [new PhantomWalletAdapter()];

    return (
        <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
                <div className="min-h-screen bg-gray-100">
                    <nav className="bg-white shadow-sm">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between h-16">
                                <div className="flex-shrink-0 flex items-center">
                                    <h1 className="text-xl font-bold text-gray-900">Staking DApp</h1>
                                </div>
                            </div>
                        </div>
                    </nav>

                    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                        <StakingDapp />
                    </main>

                    <footer className="bg-white border-t border-gray-200">
                        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                            <p className="text-center text-gray-500 text-sm">
                                © 2025 Staking DApp. All rights reserved.
                            </p>
                        </div>
                    </footer>
                </div>
            </WalletModalProvider>
        </WalletProvider>
    );
};

export default App;