import { createSmartAccountClient } from '@coinbase/smart-wallet-sdk';
import { BASE_SEPOLIA } from '../config/wallet';
import { parseEther } from 'viem';

export interface SubAccountConfig {
  name: string;
  description?: string;
  imageUrl?: string;
  spendLimit?: string; // Daily spend limit in ETH
}

export interface SubAccount {
  address: string;
  name: string;
  description?: string;
  imageUrl?: string;
  createdAt: Date;
  spendLimit?: string;
  dailySpent?: string;
  lastVerified?: Date;
}

// Verification fee in ETH (0.001 ETH = 0.1 cents)
const VERIFICATION_FEE = parseEther('0.001');

// Default spend limit (0.01 ETH = ~$0.02)
const DEFAULT_SPEND_LIMIT = parseEther('0.01');

// Verification expiry time (24 hours)
const VERIFICATION_EXPIRY = 24 * 60 * 60 * 1000;

export const createSubAccount = async (
  ownerAddress: string,
  config: SubAccountConfig
): Promise<SubAccount> => {
  try {
    const smartAccountClient = await createSmartAccountClient({
      chain: BASE_SEPOLIA,
      ownerAddress,
    });

    const spendLimit = config.spendLimit ? parseEther(config.spendLimit) : DEFAULT_SPEND_LIMIT;

    const subAccount = await smartAccountClient.createSubAccount({
      name: config.name,
      description: config.description,
      imageUrl: config.imageUrl,
      spendLimit: spendLimit.toString(),
    });

    return {
      ...subAccount,
      spendLimit: spendLimit.toString(),
      dailySpent: '0',
    };
  } catch (error) {
    console.error('Error creating sub account:', error);
    throw error;
  }
};

export const getSubAccounts = async (ownerAddress: string): Promise<SubAccount[]> => {
  try {
    const smartAccountClient = await createSmartAccountClient({
      chain: BASE_SEPOLIA,
      ownerAddress,
    });

    const subAccounts = await smartAccountClient.getSubAccounts();
    return subAccounts;
  } catch (error) {
    console.error('Error getting sub accounts:', error);
    throw error;
  }
};

export const deleteSubAccount = async (
  ownerAddress: string,
  subAccountAddress: string
): Promise<void> => {
  try {
    const smartAccountClient = await createSmartAccountClient({
      chain: BASE_SEPOLIA,
      ownerAddress,
    });

    await smartAccountClient.deleteSubAccount(subAccountAddress);
  } catch (error) {
    console.error('Error deleting sub account:', error);
    throw error;
  }
};

export const verifyHumanity = async (
  ownerAddress: string,
  subAccountAddress: string
): Promise<{ success: boolean; txHash?: string; expiryDate?: Date }> => {
  try {
    const smartAccountClient = await createSmartAccountClient({
      chain: BASE_SEPOLIA,
      ownerAddress,
    });

    // Check if sub account has enough balance and hasn't exceeded spend limit
    const balance = await getSubAccountBalance(ownerAddress, subAccountAddress);
    const dailySpent = await getDailySpent(ownerAddress, subAccountAddress);
    const spendLimit = await getSpendLimit(ownerAddress, subAccountAddress);

    if (BigInt(balance) < VERIFICATION_FEE) {
      throw new Error('Insufficient balance for verification');
    }

    if (BigInt(dailySpent) + VERIFICATION_FEE > BigInt(spendLimit)) {
      throw new Error('Daily spend limit exceeded');
    }

    // Send verification fee from sub account
    const tx = await smartAccountClient.sendTransaction({
      from: subAccountAddress,
      to: ownerAddress, // Send back to owner
      value: VERIFICATION_FEE,
    });

    const expiryDate = new Date(Date.now() + VERIFICATION_EXPIRY);

    return {
      success: true,
      txHash: tx.hash,
      expiryDate,
    };
  } catch (error) {
    console.error('Error verifying humanity:', error);
    throw error;
  }
};

export const checkVerificationStatus = async (
  ownerAddress: string,
  subAccountAddress: string
): Promise<{ isVerified: boolean; expiryDate?: Date }> => {
  try {
    const smartAccountClient = await createSmartAccountClient({
      chain: BASE_SEPOLIA,
      ownerAddress,
    });

    const lastVerified = await smartAccountClient.getLastVerified(subAccountAddress);
    
    if (!lastVerified) {
      return { isVerified: false };
    }

    const expiryDate = new Date(lastVerified.getTime() + VERIFICATION_EXPIRY);
    const isVerified = Date.now() < expiryDate.getTime();

    return {
      isVerified,
      expiryDate: isVerified ? expiryDate : undefined,
    };
  } catch (error) {
    console.error('Error checking verification status:', error);
    throw error;
  }
};

export const getSubAccountBalance = async (
  ownerAddress: string,
  subAccountAddress: string
): Promise<string> => {
  try {
    const smartAccountClient = await createSmartAccountClient({
      chain: BASE_SEPOLIA,
      ownerAddress,
    });

    const balance = await smartAccountClient.getBalance(subAccountAddress);
    return balance.toString();
  } catch (error) {
    console.error('Error getting sub account balance:', error);
    throw error;
  }
};

export const getSpendLimit = async (
  ownerAddress: string,
  subAccountAddress: string
): Promise<string> => {
  try {
    const smartAccountClient = await createSmartAccountClient({
      chain: BASE_SEPOLIA,
      ownerAddress,
    });

    const spendLimit = await smartAccountClient.getSpendLimit(subAccountAddress);
    return spendLimit.toString();
  } catch (error) {
    console.error('Error getting spend limit:', error);
    throw error;
  }
};

export const getDailySpent = async (
  ownerAddress: string,
  subAccountAddress: string
): Promise<string> => {
  try {
    const smartAccountClient = await createSmartAccountClient({
      chain: BASE_SEPOLIA,
      ownerAddress,
    });

    const dailySpent = await smartAccountClient.getDailySpent(subAccountAddress);
    return dailySpent.toString();
  } catch (error) {
    console.error('Error getting daily spent:', error);
    throw error;
  }
};

export const updateSpendLimit = async (
  ownerAddress: string,
  subAccountAddress: string,
  newLimit: string
): Promise<void> => {
  try {
    const smartAccountClient = await createSmartAccountClient({
      chain: BASE_SEPOLIA,
      ownerAddress,
    });

    await smartAccountClient.updateSpendLimit(subAccountAddress, parseEther(newLimit));
  } catch (error) {
    console.error('Error updating spend limit:', error);
    throw error;
  }
}; 