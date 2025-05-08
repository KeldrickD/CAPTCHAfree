'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import Image from 'next/image';
import SmartWalletSetup from './SmartWalletSetup';
import { VERIFICATION_FEE } from '../utils/subAccount';

// Sample fake CAPTCHA images
const captchaImages = [
  '/captchas/captcha1.png',
  '/captchas/captcha2.png',
  '/captchas/captcha3.png',
  '/captchas/captcha4.png',
];

const STORAGE_KEY = 'captchafree_verified';

export default function Captcha() {
  const { isConnected, connect, sendTransaction, address } = useWallet();
  const [captchaImage] = useState(() => captchaImages[Math.floor(Math.random() * captchaImages.length)]);
  const [solved, setSolved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [smartWalletEnabled, setSmartWalletEnabled] = useState(false);
  const [showSmartWalletSetup, setShowSmartWalletSetup] = useState(false);
  const [demoMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('demo') === 'true';
    }
    return false;
  });
  const [error, setError] = useState<string | null>(null);

  // Load verified state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && address) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const { txHash: storedTxHash, walletAddress } = JSON.parse(stored);
          if (walletAddress === address) {
            setTxHash(storedTxHash);
            setSolved(true);
            setSmartWalletEnabled(true);
          }
        } catch (error) {
          console.error('Failed to parse stored verification:', error);
        }
      }
    }
  }, [address]);

  useEffect(() => {
    // Check if already verified
    const verification = localStorage.getItem('humanity_verified');
    if (verification) {
      const { timestamp } = JSON.parse(verification);
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        setSolved(true);
      }
    }
  }, []);

  const handleSolve = async () => {
    if (!isConnected) {
      await connect();
      return;
    }

    if (!smartWalletEnabled) {
      setShowSmartWalletSetup(true);
      return;
    }

    setLoading(true);
    try {
      if (demoMode) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSolved(true);
      } else {
        const hash = await sendTransaction(
          '0x0000000000000000000000000000000000000000', // Zero address for verification
          VERIFICATION_FEE
        );
        setTxHash(hash);
        setSolved(true);
        // Store verification in localStorage
        if (address) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            txHash: hash,
            walletAddress: address,
          }));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify humanity');
    } finally {
      setLoading(false);
    }
  };

  const handleSmartWalletSetupComplete = () => {
    setSmartWalletEnabled(true);
    setShowSmartWalletSetup(false);
  };

  if (solved) {
    return (
      <div className="text-center p-4 bg-green-50 rounded-lg">
        <p className="text-green-600">Humanity verified!</p>
        {txHash && (
          <a
            href={`https://sepolia.basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            View transaction
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto mt-16 bg-white rounded-2xl shadow-lg space-y-6">
      <h1 className="text-3xl font-bold text-center">🤖 CAPTCHAfree</h1>
      <p className="text-center text-gray-500">
        Prove you&apos;re a human by skipping this CAPTCHA with 0.001 ETH. No popups.
      </p>

      {!isConnected && (
        <div className="text-center">
          <button
            className="bg-[#0052FF] text-white px-4 py-2 rounded-lg hover:bg-[#0043CC] transition-colors flex items-center justify-center mx-auto"
            onClick={handleSolve}
          >
            <Image 
              src="/coinbase-wallet-logo.svg" 
              alt="Coinbase Wallet" 
              width={20}
              height={20}
              className="mr-2"
            />
            Connect Coinbase Wallet
          </button>
        </div>
      )}

      {isConnected && showSmartWalletSetup && (
        <SmartWalletSetup onSetupComplete={handleSmartWalletSetupComplete} />
      )}

      {isConnected && !showSmartWalletSetup && !solved && (
        <>
          <div className="flex justify-center">
            <Image
              src={captchaImage}
              alt="CAPTCHA Challenge"
              width={300}
              height={100}
              className="rounded-lg w-full max-w-sm border shadow"
              priority
            />
          </div>
          <div className="text-center relative group">
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSolve}
              disabled={loading}
            >
              {loading ? 'Solving...' : 'Solve Instantly for 0.001 ETH'}
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              This will use your spend limit. No popup required.
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </>
      )}

      {isConnected && !solved && error && (
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Verification Error</h3>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={handleSolve}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
} 