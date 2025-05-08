'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { VERIFICATION_FEE } from '../utils/subAccount';
import { ethers } from 'ethers';
import Image from 'next/image';

interface CaptchaProps {
  onSolve: (txHash?: string) => void;
}

const Captcha: React.FC<CaptchaProps> = ({ onSolve }) => {
  const { address, sendTransaction } = useWallet();
  const [solved, setSolved] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  
  // Available captcha images
  const captchaImages = [
    '/captchas/captcha1.png',
    '/captchas/captcha2.png',
    '/captchas/captcha3.png',
    '/captchas/captcha4.png',
  ];
  
  // Select a random captcha image on initial load
  const [captchaImage] = useState(() => {
    const randomIndex = Math.floor(Math.random() * captchaImages.length);
    return captchaImages[randomIndex];
  });

  useEffect(() => {
    // Fetch ETH price
    const fetchEthPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await response.json();
        setEthPrice(data.ethereum.usd);
      } catch (error) {
        console.error('Failed to fetch ETH price:', error);
      }
    };
    fetchEthPrice();
  }, []);

  useEffect(() => {
    // Check if already verified - only run on client side
    if (typeof window !== 'undefined') {
      const verification = localStorage.getItem('humanity_verified');
      if (verification) {
        try {
          const { timestamp, txHash } = JSON.parse(verification);
          if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
            setSolved(true);
            setTxHash(txHash);
            onSolve(txHash);
          }
        } catch (error) {
          console.error('Error parsing verification data:', error);
          // Invalid data in localStorage, remove it
          localStorage.removeItem('humanity_verified');
        }
      }
    }
  }, [onSolve]);

  const handleSolve = async () => {
    try {
      setError(null);
      setLoading(true);
      if (!address) {
        setError('Please connect your wallet first');
        return;
      }

      // Use a direct string value for the ETH amount
      // 0.001 ETH is a safe, small amount for verification
      const verificationFeeEth = '0.001';
      
      // Send verification transaction
      const hash = await sendTransaction(
        '0x0000000000000000000000000000000000000000', // Zero address for verification
        verificationFeeEth
      );
      setTxHash(hash);
      setSolved(true);
      
      // Store verification in localStorage - only on client side
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'humanity_verified',
          JSON.stringify({
            timestamp: Date.now(),
            txHash: hash,
          })
        );
      }
      
      onSolve(hash);
    } catch (err) {
      console.error('Transaction error:', err);
      setError(err instanceof Error ? err.message : 'Failed to verify humanity');
    } finally {
      setLoading(false);
    }
  };

  const getUsdValue = () => {
    if (!ethPrice) return null;
    // Use a fixed value to match our direct string above
    const ethValue = 0.001;
    return (ethValue * ethPrice).toFixed(2);
  };

  if (solved) {
    return (
      <div className="text-center p-4 sm:p-6 bg-success-light rounded-xl border border-success animate-fade-in">
        <div className="mb-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-success rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-success mb-2">Humanity Verified!</h3>
        {txHash && (
          <a
            href={`https://sepolia.basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base-blue hover:text-blue-700 text-sm inline-flex items-center"
          >
            <span>View transaction</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h3 className="text-xl sm:text-2xl font-bold text-base-dark mb-2">Verify Humanity</h3>
        <p className="text-gray-600 text-sm sm:text-base">
          Skip the CAPTCHA with a small ETH transaction
        </p>
      </div>

      <div className="border-2 border-base-light rounded-xl p-4 sm:p-6 bg-white">
        {/* Traditional CAPTCHA display */}
        <div className="mb-6">
          <div className="bg-gray-100 rounded-lg border border-gray-300">
            {/* CAPTCHA Header */}
            <div className="bg-gray-200 px-3 py-2 rounded-t-lg border-b border-gray-300 flex justify-between items-center">
              <span className="font-medium text-sm text-gray-700">reCAPTCHA</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-600">Protected by</span>
                <span className="font-semibold text-xs text-gray-700">Google</span>
              </div>
            </div>
            
            {/* CAPTCHA Image */}
            <div className="p-3">
              <div className="w-full h-[160px] relative">
                <Image
                  src={captchaImage}
                  alt="CAPTCHA verification"
                  fill
                  className="object-contain"
                  quality={95}
                  priority
                />
              </div>
            </div>
            
            {/* CAPTCHA Footer */}
            <div className="bg-gray-200 px-3 py-1.5 rounded-b-lg border-t border-gray-300 flex justify-between items-center">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-xs text-gray-600">Refresh</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-gray-600">Help</span>
              </div>
            </div>
          </div>
          
          {/* "I'm not a robot" checkbox */}
          <div className="mt-3 border border-gray-300 rounded px-4 py-3 flex items-center gap-3 bg-white">
            <div className="w-5 h-5 flex-shrink-0 rounded border border-gray-400"></div>
            <span className="text-sm text-gray-700">I'm not a robot</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-danger-light text-danger rounded-lg border border-danger animate-shake">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-4">Skip this CAPTCHA by verifying with blockchain</p>
          
          <button
            onClick={handleSolve}
            disabled={loading}
            className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[44px] mx-auto"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </>
            ) : (
              'Verify with Blockchain'
            )}
          </button>
        </div>

        <div className="text-center text-xs text-gray-500 mt-4 group relative">
          <span>Cost: 0.001 ETH</span>
          {ethPrice && (
            <span className="ml-1">
              (≈${getUsdValue()} USD)
            </span>
          )}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Current ETH Price: ${ethPrice?.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Captcha; 