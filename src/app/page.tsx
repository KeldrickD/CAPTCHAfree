'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { WalletProvider } from '../context/WalletContext';

// Import components with dynamic import to avoid SSR issues
const ConnectWallet = dynamic(() => import('../components/ConnectWallet'), { ssr: false });
const Captcha = dynamic(() => import('../components/Captcha'), { ssr: false });
const ZoraNFT = dynamic(() => import('../components/ZoraNFT'), { ssr: false });
const RaffleEntry = dynamic(() => import('../components/RaffleEntry'), { ssr: false });

export default function Home() {
  const [isVerified, setIsVerified] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleVerification = (hash?: string) => {
    setIsVerified(true);
    if (hash) setTxHash(hash);
  };

  return (
    <WalletProvider>
      <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-md mx-auto rounded-xl shadow-lg bg-white p-6">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2"><span className="text-blue-600">CAPTCHAfree</span></h1>
            <p className="text-center text-gray-600">Skip CAPTCHAs by verifying your humanity with a small ETH transaction</p>
          </div>
          
          <div className="mb-8 flex justify-end">
            <ConnectWallet />
          </div>
          
          <div className="border-t pt-6">
            {!isVerified ? (
              <Captcha 
                onSolve={(hash?: string) => handleVerification(hash)} 
              />
            ) : (
              <div className="space-y-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <h2 className="text-xl font-bold text-green-700 mb-2">
                    🎉 Welcome, Verified Human!
                  </h2>
                  <p className="text-gray-700 mb-2">
                    You now have access to all protected content.
                  </p>
                </div>
                
                <ZoraNFT txHash={txHash || undefined} />
                
                {/* Raffle Entry Component */}
                <div className="mt-6">
                  <RaffleEntry />
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center text-xs text-gray-500">
            <p>Running on Base Sepolia Testnet</p>
            <p>To get test ETH, visit the <a href="https://www.coinbase.com/faucets/base-sepolia-faucet" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Base Sepolia Faucet</a></p>
          </div>
        </div>
      </main>
    </WalletProvider>
  );
}
