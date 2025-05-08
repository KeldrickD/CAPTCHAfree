'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { VERIFICATION_FEE } from '../utils/subAccount';
import { ethers } from 'ethers';

interface CaptchaProps {
  onSolve: () => void;
}

const Captcha: React.FC<CaptchaProps> = ({ onSolve }) => {
  const { address, sendTransaction } = useWallet();
  const [solved, setSolved] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    }
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
    <div className="text-center p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Verify Humanity</h3>
      <p className="text-gray-600 mb-4">
        To verify your humanity, you need to send a small amount of ETH.
      </p>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button
        onClick={handleSolve}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
      >
        Verify Humanity
      </button>
    </div>
  );
};

export default Captcha; 