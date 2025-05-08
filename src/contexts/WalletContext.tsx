'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { ethers } from 'ethers';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  provider: ethers.BrowserProvider | null;
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  address: null,
  connect: async () => {},
  disconnect: () => {},
  provider: null,
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [walletSDK, setWalletSDK] = useState<CoinbaseWalletSDK | null>(null);

  useEffect(() => {
    // Initialize Coinbase Wallet SDK
    const sdk = new CoinbaseWalletSDK({
      appName: 'CAPTCHAfree',
      appLogoUrl: 'https://captchafree.vercel.app/logo.png',
      darkMode: false,
    });

    setWalletSDK(sdk);

    // Check if already connected
    const checkConnection = async () => {
      try {
        const provider = sdk.makeWeb3Provider();
        const accounts = await provider.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          setIsConnected(true);
          setAddress(accounts[0]);
          setProvider(new ethers.BrowserProvider(provider));
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    };

    checkConnection();
  }, []);

  const connect = async () => {
    if (!walletSDK) return;

    try {
      const provider = walletSDK.makeWeb3Provider();
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      
      if (accounts && accounts.length > 0) {
        setIsConnected(true);
        setAddress(accounts[0]);
        setProvider(new ethers.BrowserProvider(provider));
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setAddress(null);
    setProvider(null);
  };

  return (
    <WalletContext.Provider value={{ isConnected, address, connect, disconnect, provider }}>
      {children}
    </WalletContext.Provider>
  );
}; 