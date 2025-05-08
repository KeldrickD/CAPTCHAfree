'use client';

import { useState } from 'react';

interface SmartWalletSetupProps {
  onSetupComplete: () => void;
}

export default function SmartWalletSetup({ onSetupComplete }: SmartWalletSetupProps) {
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [spendLimit, setSpendLimit] = useState('0.001');

  const enableSmartWallet = async () => {
    setIsSettingUp(true);
    try {
      // TODO: Implement actual Smart Wallet setup once SDK is available
      console.log('Setting up Smart Wallet with spend limit:', spendLimit);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate setup delay
      onSetupComplete();
    } catch (error) {
      console.error('Failed to setup Smart Wallet:', error);
    } finally {
      setIsSettingUp(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Setup Smart Wallet</h2>
      <p className="text-gray-600">
        Enable your Smart Wallet to skip CAPTCHAs with one click. No more popups after setup!
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="spendLimit" className="block text-sm font-medium text-gray-700">
            Daily Spend Limit (ETH)
          </label>
          <input
            type="number"
            id="spendLimit"
            value={spendLimit}
            onChange={(e) => setSpendLimit(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            step="0.001"
            min="0.001"
          />
          <p className="mt-1 text-sm text-gray-500">
            This is the maximum amount you can spend per day on CAPTCHA verifications
          </p>
        </div>

        <button
          onClick={enableSmartWallet}
          disabled={isSettingUp}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSettingUp ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Setting up Smart Wallet...
            </>
          ) : (
            'Enable Smart Wallet'
          )}
        </button>
      </div>
    </div>
  );
} 