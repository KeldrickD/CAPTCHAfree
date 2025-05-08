'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
  sendTransaction: (amount: string) => Promise<string>;
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

interface WalletRequest {
  method: string;
  params?: unknown[];
}

type WalletCallback = (error: Error | null, response?: unknown) => void;

interface CoinbaseWalletProvider {
  request: (args: WalletRequest) => Promise<unknown>;
  on: (event: string, callback: WalletCallback) => void;
  removeListener: (event: string, callback: WalletCallback) => void;
}

declare global {
  interface Window {
    coinbaseWalletExtension?: CoinbaseWalletProvider;
  }
}

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  const coinbaseWallet = new CoinbaseWalletSDK({
    appName: 'CAPTCHAfree',
    appLogoUrl: 'https://captchafree.vercel.app/logo.png',
    // @ts-expect-error - chainId is supported but not in types
    chainId: BASE_SEPOLIA.id,
  });

  const connect = async () => {
    try {
      const provider = coinbaseWallet.makeWeb3Provider();
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();

      setProvider(ethersProvider);
      setSigner(signer);
      setAddress(address);
      setIsConnected(true);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  };

  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
    setProvider(null);
    setSigner(null);
  };

  const sendTransaction = async (amount: string): Promise<string> => {
    if (!signer || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      const tx = await signer.sendTransaction({
        to: address,
        value: ethers.utils.parseEther(amount),
      });
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      if (window.coinbaseWalletExtension) {
        try {
          await connect();
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();
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