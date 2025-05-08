'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { ethers } from 'ethers';

interface Verification {
  address: string;
  txHash: string;
  timestamp: Date;
}

const AdminDashboard: React.FC = () => {
  const { address } = useWallet();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Admin addresses that are allowed to view this dashboard
  const ADMIN_ADDRESSES: string[] = [
    // Add your admin wallet addresses here (lowercase)
  ];

  useEffect(() => {
    // Check if current user is an admin
    if (address) {
      setIsAdmin(ADMIN_ADDRESSES.includes(address.toLowerCase()));
    }
  }, [address]);

  useEffect(() => {
    if (isAdmin) {
      fetchVerifications();
    }
  }, [isAdmin]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      
      // This would be where you fetch verification data from the blockchain
      // For now, we'll simulate some data
      
      // In a real implementation, you would:
      // 1. Connect to Base Sepolia
      // 2. Query transaction history for verification transactions
      // 3. Parse and display the data
      
      // Simulated data for demonstration
      const mockData: Verification[] = [
        {
          address: '0x1234...5678',
          txHash: '0xabcd...ef01',
          timestamp: new Date(Date.now() - 86400000) // 1 day ago
        },
        {
          address: '0x8765...4321',
          txHash: '0xfedc...ba98',
          timestamp: new Date(Date.now() - 43200000) // 12 hours ago
        },
        {
          address: '0xaaaa...bbbb',
          txHash: '0xcccc...dddd',
          timestamp: new Date(Date.now() - 3600000) // 1 hour ago
        }
      ];
      
      setVerifications(mockData);
    } catch (err) {
      console.error('Error fetching verifications:', err);
      setError('Failed to load verification data');
    } finally {
      setLoading(false);
    }
  };

  const handleAirdrop = (address: string) => {
    // This would trigger your airdrop process
    console.log(`Initiating airdrop to ${address}`);
    // In a real implementation, you would call your NFT minting/transfer function here
  };

  if (!address) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p>Please connect your wallet to access the admin dashboard.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-red-600">You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Verification Admin Dashboard</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Recent Verifications</h2>
        <p className="text-gray-600 mb-4">
          These are users who have verified their humanity through ETH transactions.
          You can airdrop NFTs to them using the buttons below.
        </p>
        
        {loading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-blue-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-blue-800">Address</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-blue-800">Transaction Hash</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-blue-800">Timestamp</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-blue-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {verifications.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                      No verifications found
                    </td>
                  </tr>
                ) : (
                  verifications.map((verification, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{verification.address}</td>
                      <td className="px-4 py-3 text-sm">
                        <a 
                          href={`https://sepolia.basescan.org/tx/${verification.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {verification.txHash.substring(0, 6)}...{verification.txHash.substring(verification.txHash.length - 4)}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-sm">{verification.timestamp.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleAirdrop(verification.address)}
                          className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                          Airdrop NFT
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Implementation Notes</h2>
        <div className="bg-yellow-50 p-4 rounded-md">
          <p className="text-gray-800 mb-2">
            <strong>Important:</strong> This is a starter template for your admin dashboard.
          </p>
          <p className="text-gray-700 mb-2">
            To fully implement this feature, you'll need to:
          </p>
          <ol className="list-decimal list-inside text-gray-700 space-y-1 ml-4">
            <li>Add your admin wallet addresses to the ADMIN_ADDRESSES array</li>
            <li>Implement blockchain queries to fetch actual verification transactions</li>
            <li>Connect your NFT minting/transfer logic to the airdrop function</li>
            <li>Add authentication and security measures to protect the admin dashboard</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 