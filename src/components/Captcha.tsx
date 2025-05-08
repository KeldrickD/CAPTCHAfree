'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import Image from 'next/image';
import SmartWalletSetup from './SmartWalletSetup';

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
        const hash = await sendTransaction('0.001');
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
    } catch (error) {
      console.error('Failed to solve CAPTCHA:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSmartWalletSetupComplete = () => {
    setSmartWalletEnabled(true);
    setShowSmartWalletSetup(false);
  };

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

      {isConnected && solved && (
        <div className="bg-green-100 p-5 rounded-xl text-center">
          <h2 className="text-xl font-semibold text-green-700">✅ Access Granted</h2>
          <p className="text-gray-700 mt-2">
            Welcome, verified human. You&apos;ve solved the challenge.
          </p>

          {txHash && (
            <div className="mt-4 p-3 bg-white rounded-lg border text-left">
              <h3 className="font-bold">Transaction Details:</h3>
              <p className="mt-1 text-sm text-gray-700 break-all">
                TX Hash: {txHash}
              </p>
            </div>
          )}

          <div className="mt-4 p-3 bg-white rounded-lg border text-left">
            <h3 className="font-bold">Secret Message:</h3>
            <p className="mt-1 text-sm text-gray-700">
              The real CAPTCHA was the friends we made along the way.
            </p>
          </div>

          <div className="mt-4 p-3 bg-white rounded-lg border text-left">
            <h3 className="font-bold">🎁 Bonus Content:</h3>
            <p className="mt-1 text-sm text-gray-700">
              You&apos;ve unlocked access to our exclusive content. Check back soon for more!
            </p>
          </div>

          <div className="mt-4 p-3 bg-white rounded-lg border text-left">
            <h3 className="font-bold">🎨 Claim Your NFT:</h3>
            <p className="mt-1 text-sm text-gray-700 mb-2">
              As a reward for solving the CAPTCHA, claim your exclusive NFT!
            </p>
            <a
              href="https://zora.co/coin/base:0x7cacb079e2c91e1e18a82f7a4a0fce3417dbfa4c?referrer=0x4c2d60f208f5217e4e8edc6af6cf47fc366329c9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              View on Zora
            </a>
          </div>
        </div>
      )}
    </div>
  );
} 