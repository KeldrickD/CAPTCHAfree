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
  isSmartWallet: boolean;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
  provider: null,
  signer: null,
  sendTransaction: async () => '',
  isSmartWallet: false,
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

// Convert a decimal ETH value to a hex Wei value
// This is a simple conversion without using BigNumber
function ethToHexWei(ethValue: string): string {
  try {
    // Convert ETH to Wei (1 ETH = 10^18 Wei)
    const eth = parseFloat(ethValue);
    const wei = eth * 1e18;
    
    // Convert to hex with "0x" prefix
    return "0x" + Math.floor(wei).toString(16);
  } catch (error) {
    console.error("Error converting ETH to hex Wei:", error);
    throw new Error("Invalid ETH value format");
  }
}

// Client-side check
const isBrowser = typeof window !== 'undefined';

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isSmartWallet, setIsSmartWallet] = useState(false);
  const [walletProvider, setWalletProvider] = useState<any>(null);

  const connect = async () => {
    if (!isBrowser) return;
    
    try {
      // Initialize the Coinbase Wallet SDK with canary flag
      const coinbaseWallet = new CoinbaseWalletSDK({
        appName: 'CAPTCHAfree',
        appLogoUrl: 'https://captchafree.vercel.app/logo.png',
        // @ts-ignore - canary flag is supported but not in types
        canary: true
      });

      // Create provider with Smart Wallet option - using smartWalletOnly
      const provider = coinbaseWallet.makeWeb3Provider(
        BASE_SEPOLIA.rpcUrls.default.http[0], 
        BASE_SEPOLIA.id,
        // @ts-ignore - options parameter is supported but not in types
        { options: 'smartWalletOnly' }
      );
      
      // Save the provider for direct RPC access
      setWalletProvider(provider);
      
      // Request accounts to connect - this will trigger the Smart Wallet UI
      await provider.request({ method: 'eth_requestAccounts' });
      
      // @ts-expect-error - Type issues with provider
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      await ethersProvider.ready;
      
      const signer = ethersProvider.getSigner();
      const userAddress = await signer.getAddress();

      // FORCE SMART WALLET: Since we're using smartWalletOnly option,
      // we can safely assume this is a smart wallet
      setIsSmartWallet(true);
      console.log('Smart Wallet enabled:', true);

      // Set state
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
    setIsSmartWallet(false);
    setWalletProvider(null);
  };

  const sendTransaction = async (to: string, value: string): Promise<string> => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      // Always use the direct RPC method since we're forcing Smart Wallet mode
      if (walletProvider) {
        // For Smart Wallet, use the direct RPC method with our custom hex conversion
        console.log('Using direct RPC method for transaction');
        
        // Convert the ETH value to hex Wei format
        // Using our simple custom function to avoid BigNumber issues
        const hexValue = ethToHexWei(value);
        console.log('Transaction params:', { from: address, to, value: hexValue });
        
        // Call directly with explicit params and no complex objects
        const txHash = await walletProvider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: address,
            to: to,
            value: hexValue
          }]
        }) as string;
        
        return txHash;
      } else if (signer) {
        // This path should not be used with Smart Wallet
        console.warn('FALLING BACK to ethers.js - this should not happen with Smart Wallet');
        const tx = await signer.sendTransaction({
          to,
          value: ethers.utils.parseEther(value),
        });
        return tx.hash;
      } else {
        throw new Error('No wallet provider available');
      }
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
        isSmartWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext); 