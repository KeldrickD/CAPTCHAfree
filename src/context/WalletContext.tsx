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

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  const connect = async () => {
    try {
      const coinbaseWallet = new CoinbaseWalletSDK({
        appName: 'CAPTCHAfree',
        appLogoUrl: 'https://captchafree.vercel.app/logo.png',
        // @ts-expect-error - chainId is supported but not in types
        chainId: BASE_SEPOLIA.chainId,
      });

      const provider = coinbaseWallet.makeWeb3Provider() as unknown as CoinbaseWalletProvider;
      
      // Create a custom provider that matches ethers.js v5's expected interface
      const customProvider = {
        ...provider,
        sendAsync: (request: { method: string; params?: unknown[] }, callback: JsonRpcCallback) => {
          const jsonRpcRequest: JsonRpcRequest = {
            jsonrpc: '2.0',
            id: Math.floor(Math.random() * 1000000),
            method: request.method,
            params: request.params || [],
          };
          provider.sendAsync(jsonRpcRequest, callback);
        },
        send: (request: { method: string; params?: unknown[] }, callback: JsonRpcCallback) => {
          const jsonRpcRequest: JsonRpcRequest = {
            jsonrpc: '2.0',
            id: Math.floor(Math.random() * 1000000),
            method: request.method,
            params: request.params || [],
          };
          provider.send(jsonRpcRequest, callback);
        },
      };

      const ethersProvider = new ethers.providers.Web3Provider(customProvider);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();

      setProvider(ethersProvider);
      setSigner(signer);
      setAddress(address);
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
    // Check if wallet is already connected
    if (typeof window !== 'undefined' && window.coinbaseWalletExtension) {
      connect().catch(console.error);
    }
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