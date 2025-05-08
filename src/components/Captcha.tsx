'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { VERIFICATION_FEE } from '../utils/subAccount';
import { ethers } from 'ethers';
import Image from 'next/image';

interface CaptchaProps {
  onSolve: () => void;
}

const Captcha: React.FC<CaptchaProps> = ({ onSolve }) => {
  const { address, sendTransaction } = useWallet();
  const [solved, setSolved] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ethPrice, setEthPrice] = useState<number | null>(null);

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
    // Check if already verified
    const verification = localStorage.getItem('humanity_verified');
    if (verification) {
      const { timestamp } = JSON.parse(verification);
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        setSolved(true);
        onSolve();
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

      // Send verification transaction
      const hash = await sendTransaction(
        '0x0000000000000000000000000000000000000000', // Zero address for verification
        ethers.utils.formatEther(VERIFICATION_FEE)
      );
      setTxHash(hash);
      setSolved(true);
      // Store verification in localStorage
      localStorage.setItem(
        'humanity_verified',
        JSON.stringify({
          timestamp: Date.now(),
          txHash: hash,
        })
      );
      onSolve();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify humanity');
    } finally {
      setLoading(false);
    }
  };

  const getUsdValue = () => {
    if (!ethPrice) return null;
    const ethValue = parseFloat(ethers.utils.formatEther(VERIFICATION_FEE));
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
        <div className="flex items-center justify-center mb-4 sm:mb-6">
          <div className="relative w-[200px] h-[100px] transition-all duration-300 ease-in-out transform hover:scale-[1.02]">
            <Image
              src="/captcha-placeholder.svg"
              alt="CAPTCHA"
              fill
              className="rounded-lg object-contain"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-danger-light text-danger rounded-lg border border-danger animate-shake">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleSolve}
          disabled={loading}
          className="w-full bg-base-blue text-white font-semibold px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[44px]"
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
            'Verify Humanity'
          )}
        </button>

        <div className="text-center text-sm text-gray-500 mt-4 group relative">
          <span>Cost: {ethers.utils.formatEther(VERIFICATION_FEE)} ETH</span>
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