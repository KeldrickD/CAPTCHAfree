'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { createSubAccount, getSubAccounts, deleteSubAccount, SubAccountConfig, SubAccount } from '../utils/subAccount';

export const SubAccountManager: React.FC = () => {
  const { address } = useWallet();
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SubAccountConfig>({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (address) {
      loadSubAccounts();
    }
  }, [address]);

  const loadSubAccounts = async () => {
    if (!address) return;
    
    try {
      setIsLoading(true);
      const accounts = await getSubAccounts(address);
      setSubAccounts(accounts);
    } catch (err) {
      setError('Failed to load sub accounts');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    try {
      setIsLoading(true);
      setError(null);
      const newSubAccount = await createSubAccount(address, formData);
      setSubAccounts([...subAccounts, newSubAccount]);
      setFormData({ name: '', description: '' });
    } catch (err) {
      setError('Failed to create sub account');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (subAccountAddress: string) => {
    if (!address) return;

    try {
      setIsLoading(true);
      setError(null);
      await deleteSubAccount(address, subAccountAddress);
      setSubAccounts(subAccounts.filter(acc => acc.address !== subAccountAddress));
    } catch (err) {
      setError('Failed to delete sub account');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!address) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Please connect your wallet to manage sub accounts</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Sub Account Manager</h2>
      
      {/* Create Sub Account Form */}
      <form onSubmit={handleSubmit} className="mb-8 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Create New Sub Account</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Sub Account'}
          </button>
        </div>
      </form>

      {/* Sub Accounts List */}
      <div className="bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold p-4 border-b">Your Sub Accounts</h3>
        {error && (
          <div className="p-4 text-red-600 bg-red-50">
            {error}
          </div>
        )}
        {isLoading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : subAccounts.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No sub accounts found</div>
        ) : (
          <div className="divide-y">
            {subAccounts.map((account) => (
              <div key={account.address} className="p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{account.name}</h4>
                  <p className="text-sm text-gray-500">{account.address}</p>
                  {account.description && (
                    <p className="text-sm text-gray-600 mt-1">{account.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(account.address)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 