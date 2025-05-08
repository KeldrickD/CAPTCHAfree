'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendTransaction: (amount: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

type WalletRequest = {
  method: string;
  params?: unknown[];
};

type WalletCallback = (params: unknown) => void;

declare global {
  interface Window {
    coinbaseWalletExtension?: {
      request: (args: WalletRequest) => Promise<unknown>;
      on: (event: string, callback: WalletCallback) => void;
      removeListener: (event: string, callback: WalletCallback) => void;
    };
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    // Check if Coinbase Wallet is installed
    const checkWallet = async () => {
      if (window.coinbaseWalletExtension) {
        try {
          const accounts = await window.coinbaseWalletExtension.request({
            method: 'eth_accounts',
          }) as string[];
          if (accounts && accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
          }
        } catch (error) {
          console.error('Failed to check wallet connection:', error);
        }
      }
    };

    checkWallet();

    // Listen for account changes
    const handleAccountsChanged = (accounts: unknown) => {
      const accountList = accounts as string[];
      if (accountList.length === 0) {
        setIsConnected(false);
        setAddress(null);
      } else {
        setAddress(accountList[0]);
        setIsConnected(true);
      }
    };

    if (window.coinbaseWalletExtension) {
      window.coinbaseWalletExtension.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.coinbaseWalletExtension) {
        window.coinbaseWalletExtension.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const connect = async () => {
    if (!window.coinbaseWalletExtension) {
      window.open('https://wallet.coinbase.com/', '_blank');
      return;
    }

    try {
      const accounts = await window.coinbaseWalletExtension.request({
        method: 'eth_requestAccounts',
      }) as string[];
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setAddress(null);
  };

  const sendTransaction = async (amount: string): Promise<string> => {
    if (!window.coinbaseWalletExtension || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      // TODO: Implement Base Smart Wallet transaction
      // This will be implemented once the SDK is available
      console.log(`Sending ${amount} ETH`);
      // Return a mock transaction hash for now
      return '0x' + Math.random().toString(16).slice(2, 42);
    } catch (error) {
      console.error('Failed to send transaction:', error);
      throw error;
    }
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        connect,
        disconnect,
        sendTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
} 