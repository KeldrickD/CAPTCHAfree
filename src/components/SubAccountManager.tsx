'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { 
  createSubAccount, 
  getSubAccounts, 
  deleteSubAccount, 
  verifyHumanity,
  getSubAccountBalance,
  getSpendLimit,
  getDailySpent,
  updateSpendLimit,
  SubAccountConfig, 
  SubAccount 
} from '../utils/subAccount';

export const SubAccountManager: React.FC = () => {
  const { address } = useWallet();
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyingAccount, setVerifyingAccount] = useState<string | null>(null);
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [spendLimits, setSpendLimits] = useState<Record<string, string>>({});
  const [dailySpent, setDailySpent] = useState<Record<string, string>>({});
  const [editingLimit, setEditingLimit] = useState<string | null>(null);
  const [formData, setFormData] = useState<SubAccountConfig>({
    name: '',
    description: '',
    spendLimit: '0.01', // Default 0.01 ETH
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
      
      // Load balances, spend limits, and daily spent for each account
      const balancePromises = accounts.map(account => 
        getSubAccountBalance(address, account.address)
          .then(balance => ({ address: account.address, balance }))
      );
      
      const limitPromises = accounts.map(account =>
        getSpendLimit(address, account.address)
          .then(limit => ({ address: account.address, limit }))
      );

      const spentPromises = accounts.map(account =>
        getDailySpent(address, account.address)
          .then(spent => ({ address: account.address, spent }))
      );
      
      const [balanceResults, limitResults, spentResults] = await Promise.all([
        Promise.all(balancePromises),
        Promise.all(limitPromises),
        Promise.all(spentPromises)
      ]);
      
      const balanceMap = balanceResults.reduce((acc, { address, balance }) => ({
        ...acc,
        [address]: balance
      }), {});
      
      const limitMap = limitResults.reduce((acc, { address, limit }) => ({
        ...acc,
        [address]: limit
      }), {});

      const spentMap = spentResults.reduce((acc, { address, spent }) => ({
        ...acc,
        [address]: spent
      }), {});
      
      setBalances(balanceMap);
      setSpendLimits(limitMap);
      setDailySpent(spentMap);
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
      setFormData({ name: '', description: '', spendLimit: '0.01' });
      
      // Load balance and spend limit for new account
      const [balance, limit, spent] = await Promise.all([
        getSubAccountBalance(address, newSubAccount.address),
        getSpendLimit(address, newSubAccount.address),
        getDailySpent(address, newSubAccount.address)
      ]);

      setBalances(prev => ({
        ...prev,
        [newSubAccount.address]: balance
      }));

      setSpendLimits(prev => ({
        ...prev,
        [newSubAccount.address]: limit
      }));

      setDailySpent(prev => ({
        ...prev,
        [newSubAccount.address]: spent
      }));
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
      
      // Remove data from state
      setBalances(prev => {
        const { [subAccountAddress]: _, ...rest } = prev;
        return rest;
      });
      setSpendLimits(prev => {
        const { [subAccountAddress]: _, ...rest } = prev;
        return rest;
      });
      setDailySpent(prev => {
        const { [subAccountAddress]: _, ...rest } = prev;
        return rest;
      });
    } catch (err) {
      setError('Failed to delete sub account');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (subAccountAddress: string) => {
    if (!address) return;

    try {
      setVerifyingAccount(subAccountAddress);
      setError(null);
      const result = await verifyHumanity(address, subAccountAddress);
      
      if (result.success) {
        // Update balance and daily spent after verification
        const [newBalance, newSpent] = await Promise.all([
          getSubAccountBalance(address, subAccountAddress),
          getDailySpent(address, subAccountAddress)
        ]);

        setBalances(prev => ({
          ...prev,
          [subAccountAddress]: newBalance
        }));

        setDailySpent(prev => ({
          ...prev,
          [subAccountAddress]: newSpent
        }));
      }
    } catch (err) {
      setError('Failed to verify humanity');
      console.error(err);
    } finally {
      setVerifyingAccount(null);
    }
  };

  const handleUpdateSpendLimit = async (subAccountAddress: string, newLimit: string) => {
    if (!address) return;

    try {
      setIsLoading(true);
      setError(null);
      await updateSpendLimit(address, subAccountAddress, newLimit);
      
      // Update spend limit in state
      setSpendLimits(prev => ({
        ...prev,
        [subAccountAddress]: newLimit
      }));
      
      setEditingLimit(null);
    } catch (err) {
      setError('Failed to update spend limit');
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
          <div>
            <label className="block text-sm font-medium text-gray-700">Daily Spend Limit (ETH)</label>
            <input
              type="number"
              step="0.001"
              min="0.001"
              value={formData.spendLimit}
              onChange={(e) => setFormData({ ...formData, spendLimit: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
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
              <div key={account.address} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{account.name}</h4>
                    <p className="text-sm text-gray-500">{account.address}</p>
                    {account.description && (
                      <p className="text-sm text-gray-600 mt-1">{account.description}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      Balance: {balances[account.address] || '0'} ETH
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Daily Spent: {dailySpent[account.address] || '0'} ETH
                    </p>
                    {editingLimit === account.address ? (
                      <div className="mt-2 flex items-center space-x-2">
                        <input
                          type="number"
                          step="0.001"
                          min="0.001"
                          value={spendLimits[account.address] || '0.01'}
                          onChange={(e) => setSpendLimits(prev => ({
                            ...prev,
                            [account.address]: e.target.value
                          }))}
                          className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleUpdateSpendLimit(account.address, spendLimits[account.address])}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingLimit(null)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 mt-1">
                        Daily Limit: {spendLimits[account.address] || '0.01'} ETH
                        <button
                          onClick={() => setEditingLimit(account.address)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleVerify(account.address)}
                      disabled={verifyingAccount === account.address}
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {verifyingAccount === account.address ? 'Verifying...' : 'Verify Humanity'}
                    </button>
                    <button
                      onClick={() => handleDelete(account.address)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 