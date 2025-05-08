'use client';

import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { BASE_SEPOLIA } from '../config/wallet';

const ConnectWallet: React.FC = () => {
  const { address, isConnected, connect, disconnect, isSmartWallet, chainId } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      await connect();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const isCorrectNetwork = chainId === BASE_SEPOLIA.id;

  return (
    <div>
      {isConnected && address ? (
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium bg-green-100 px-2 py-1 rounded text-green-700">
              {formatAddress(address)}
            </span>
            <button
              onClick={handleDisconnect}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Disconnect
            </button>
          </div>
          <div className="text-xs text-gray-600">
            {isSmartWallet ? (
              <span className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1"></span>
                Connected with Smart Wallet
              </span>
            ) : (
              <span className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-gray-500 mr-1"></span>
                Connected with Browser Wallet
              </span>
            )}
          </div>
          <div className="text-xs text-gray-600">
            {isCorrectNetwork ? (
              <span className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                Base Sepolia Testnet
              </span>
            ) : (
              <span className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1"></span>
                Wrong network! Please switch to Base Sepolia
              </span>
            )}
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={handleConnect}
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-70"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Connecting...
              </>
            ) : (
              <>Connect Wallet (Base Sepolia)</>
            )}
          </button>
          {error && (
            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectWallet; 