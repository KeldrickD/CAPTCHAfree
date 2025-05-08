'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { checkVerificationStatus, verifyHumanity } from '../utils/subAccount';

interface ProtectedContentProps {
  children: React.ReactNode;
  subAccountAddress: string;
}

export const ProtectedContent: React.FC<ProtectedContentProps> = ({
  children,
  subAccountAddress,
}) => {
  const { address } = useWallet();
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);

  useEffect(() => {
    if (address && subAccountAddress) {
      checkStatus();
    }
  }, [address, subAccountAddress]);

  const checkStatus = async () => {
    if (!address) return;

    try {
      setIsLoading(true);
      const { isVerified: verified, expiryDate: expiry } = await checkVerificationStatus(
        address,
        subAccountAddress
      );
      setIsVerified(verified);
      setExpiryDate(expiry || null);
    } catch (err) {
      setError('Failed to check verification status');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!address) return;

    try {
      setIsLoading(true);
      setError(null);
      const result = await verifyHumanity(address, subAccountAddress);
      
      if (result.success) {
        setIsVerified(true);
        setExpiryDate(result.expiryDate || null);
      }
    } catch (err) {
      setError('Failed to verify humanity');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Checking verification status...</p>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600 mb-4">Please verify your humanity to access this content</p>
        <button
          onClick={handleVerify}
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Verifying...' : 'Verify Humanity'}
        </button>
        {error && (
          <p className="mt-2 text-red-600">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      {expiryDate && (
        <div className="mb-4 p-2 bg-blue-50 text-blue-700 rounded-md">
          <p className="text-sm">
            Verification valid until: {expiryDate.toLocaleString()}
          </p>
        </div>
      )}
      {children}
    </div>
  );
}; 