import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { BASE_SEPOLIA } from '../config/wallet';
import { parseEther } from 'viem';
import { ethers } from 'ethers';

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

// Initialize Coinbase Wallet SDK
const coinbaseWallet = new CoinbaseWalletSDK({
  appName: 'CAPTCHAfree',
  appLogoUrl: 'https://captchafree.vercel.app/logo.png',
  // @ts-expect-error - chainId is supported but not in types
  chainId: BASE_SEPOLIA.id,
});

export const createSubAccount = async (
  ownerAddress: string,
  config: SubAccountConfig
): Promise<SubAccount> => {
  try {
    const provider = coinbaseWallet.makeWeb3Provider();
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const signer = await ethersProvider.getSigner();

    const spendLimit = config.spendLimit ? parseEther(config.spendLimit) : DEFAULT_SPEND_LIMIT;

    // Create a new account using the signer
    const factory = new ethers.Contract(
      '0x...', // Base Smart Wallet Factory address
      ['function createAccount(address owner, uint256 salt) returns (address)'],
      signer
    );

    const salt = ethers.utils.randomBytes(32);
    const tx = await factory.createAccount(ownerAddress, salt);
    const receipt = await tx.wait();

    // Get the new account address from the event
    const event = receipt.logs.find(
      (log: { fragment?: { name: string }; args?: unknown[] }) => log.fragment?.name === 'AccountCreated'
    );
    const subAccountAddress = event?.args[0];

    return {
      address: subAccountAddress,
      name: config.name,
      description: config.description,
      imageUrl: config.imageUrl,
      createdAt: new Date(),
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
    const provider = coinbaseWallet.makeWeb3Provider();
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const signer = await ethersProvider.getSigner();

    // Get accounts from the factory
    const factory = new ethers.Contract(
      '0x...', // Base Smart Wallet Factory address
      ['function getAccountsOfOwner(address owner) view returns (address[])'],
      signer
    );

    const accounts = await factory.getAccountsOfOwner(ownerAddress);
    return accounts.map((address: string) => ({
      address,
      name: `Sub Account ${address.slice(0, 6)}`,
      createdAt: new Date(),
    }));
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
    const provider = coinbaseWallet.makeWeb3Provider();
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const signer = await ethersProvider.getSigner();

    const account = new ethers.Contract(
      subAccountAddress,
      ['function destroy()'],
      signer
    );

    await account.destroy();
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
    const provider = coinbaseWallet.makeWeb3Provider();
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const signer = await ethersProvider.getSigner();

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
    const account = new ethers.Contract(
      subAccountAddress,
      ['function execute(address to, uint256 value, bytes data)'],
      signer
    );

    const tx = await account.execute(ownerAddress, VERIFICATION_FEE, '0x');
    const receipt = await tx.wait();

    const expiryDate = new Date(Date.now() + VERIFICATION_EXPIRY);

    return {
      success: true,
      txHash: receipt.hash,
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
    const provider = coinbaseWallet.makeWeb3Provider();
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const signer = await ethersProvider.getSigner();

    const account = new ethers.Contract(
      subAccountAddress,
      ['function lastVerified() view returns (uint256)'],
      signer
    );

    const lastVerified = await account.lastVerified();
    
    if (!lastVerified) {
      return { isVerified: false };
    }

    const expiryDate = new Date(Number(lastVerified) * 1000 + VERIFICATION_EXPIRY);
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
    const provider = coinbaseWallet.makeWeb3Provider();
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const balance = await ethersProvider.getBalance(subAccountAddress);
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
    const provider = coinbaseWallet.makeWeb3Provider();
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const signer = await ethersProvider.getSigner();

    const account = new ethers.Contract(
      subAccountAddress,
      ['function spendLimit() view returns (uint256)'],
      signer
    );

    const spendLimit = await account.spendLimit();
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
    const provider = coinbaseWallet.makeWeb3Provider();
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const signer = await ethersProvider.getSigner();

    const account = new ethers.Contract(
      subAccountAddress,
      ['function dailySpent() view returns (uint256)'],
      signer
    );

    const dailySpent = await account.dailySpent();
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
    const provider = coinbaseWallet.makeWeb3Provider();
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const signer = await ethersProvider.getSigner();

    const account = new ethers.Contract(
      subAccountAddress,
      ['function setSpendLimit(uint256 newLimit)'],
      signer
    );

    await account.setSpendLimit(parseEther(newLimit));
  } catch (error) {
    console.error('Error updating spend limit:', error);
    throw error;
  }
}; 