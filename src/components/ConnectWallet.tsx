'use client';

import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { BASE_SEPOLIA } from '../config/wallet';

// NetworkIndicator component
const NetworkIndicator: React.FC<{ chainId: number | null | undefined }> = ({ chainId }) => {
  const isCorrectNetwork = chainId === BASE_SEPOLIA.id;
  
  return (
    <span className={`flex items-center text-xs px-2 py-1 rounded ${isCorrectNetwork ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      <span className={`inline-block w-2 h-2 rounded-full mr-1 ${isCorrectNetwork ? 'bg-green-500' : 'bg-red-500'}`}></span>
      {isCorrectNetwork ? 'Base Sepolia' : 'Wrong Network'}
    </span>
  );
};

// NetworkSwitcher component
const NetworkSwitcher: React.FC = () => {
  const { switchToBaseSepolia } = useWallet();
  
  return (
    <button 
      onClick={switchToBaseSepolia}
      className="text-xs text-blue-600 hover:text-blue-800 underline"
    >
      Switch to Base Sepolia
    </button>
  );
};

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

  const formatAddress = (addr: string | null) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // For disconnected state
  if (!isConnected || !address) {
    return (
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
    );
  }

  // For connected state
  return (
    <div className="flex flex-col items-end space-y-2">
      <div className="flex items-center space-x-2">
        <NetworkIndicator chainId={chainId} />
        <div className="relative group">
          <button
            className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            onClick={handleDisconnect}
          >
            {formatAddress(address)}
          </button>
          <div className="absolute hidden group-hover:block right-0 mt-1 bg-white rounded-md shadow-lg py-1 w-40 z-10">
            <a
              href="/admin-dashboard"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Admin Dashboard
            </a>
            <button 
              onClick={handleDisconnect}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
      <NetworkSwitcher />
    </div>
  );
};

export default ConnectWallet; 