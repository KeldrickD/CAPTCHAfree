'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { BASE_SEPOLIA } from '../config/wallet';
import { ethers } from 'ethers';

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  sendTransaction: (to: string, value: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
  provider: null,
  signer: null,
  sendTransaction: async () => '',
});

interface JsonRpcRequest {
  jsonrpc: string;
  id: number;
  method: string;
  params?: unknown[];
}

interface JsonRpcCallback {
  (error: Error | null, response?: unknown): void;
}

interface CoinbaseWalletProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener: (event: string, listener: (...args: unknown[]) => void) => void;
  isCoinbaseWallet?: boolean;
  isConnected: () => boolean;
  enable: () => Promise<string[]>;
  sendAsync: (request: JsonRpcRequest, callback: JsonRpcCallback) => void;
  send: (request: JsonRpcRequest, callback: JsonRpcCallback) => void;
}

// Extend the Window interface
declare global {
  // eslint-disable-next-line no-var
  var coinbaseWalletExtension: CoinbaseWalletProvider | undefined;
}

// Client-side check
const isBrowser = typeof window !== 'undefined';

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  const connect = async () => {
    if (!isBrowser) return;
    
    try {
      const coinbaseWallet = new CoinbaseWalletSDK({
        appName: 'CAPTCHAfree',
        appLogoUrl: 'https://captchafree.vercel.app/logo.png',
      });

      // Initialize provider with the correct network
      const walletProvider = coinbaseWallet.makeWeb3Provider(
        BASE_SEPOLIA.rpcUrls.default.http[0], 
        BASE_SEPOLIA.id
      );
      
      // Request account access
      await walletProvider.request({ method: 'eth_requestAccounts' });
      
      // @ts-expect-error - Type issues with provider
      const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      await ethersProvider.ready;
      
      const signer = ethersProvider.getSigner();
      const userAddress = await signer.getAddress();

      setProvider(ethersProvider);
      setSigner(signer);
      setAddress(userAddress);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
    setProvider(null);
    setSigner(null);
  };

  const sendTransaction = async (to: string, value: string): Promise<string> => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const tx = await signer.sendTransaction({
        to,
        value: ethers.utils.parseEther(value),
      });
      return tx.hash;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  };

  useEffect(() => {
    // No automatic connection attempt - let user explicitly connect
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        connect,
        disconnect,
        provider,
        signer,
        sendTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext); 