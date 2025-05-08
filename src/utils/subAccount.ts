import { createSmartAccountClient } from '@base-org/smart-wallet-sdk';
import { BASE_SEPOLIA } from '../config/wallet';

export interface SubAccountConfig {
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface SubAccount {
  address: string;
  name: string;
  description?: string;
  imageUrl?: string;
  createdAt: Date;
}

export const createSubAccount = async (
  ownerAddress: string,
  config: SubAccountConfig
): Promise<SubAccount> => {
  try {
    const smartAccountClient = await createSmartAccountClient({
      chain: BASE_SEPOLIA,
      ownerAddress,
    });

    const subAccount = await smartAccountClient.createSubAccount({
      name: config.name,
      description: config.description,
      imageUrl: config.imageUrl,
    });

    return subAccount;
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