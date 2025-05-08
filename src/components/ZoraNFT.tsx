'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useWallet } from '../context/WalletContext';

interface NFT {
  id: string;
  name: string;
  description: string;
  contract: string;
  chain: string;
  emoji: string;
  bgClass: string;
  imageUrl?: string; // Optional URL for NFT image
  realImageUrl?: string; // URL fetched from Zora API
}

interface ZoraNFTProps {
  txHash?: string;
}

// Define NFT data outside the component to prevent recreation on each render
const NFT_DATA: NFT[] = [
  // Original NFT
  {
    id: "certified-frame-degen",
    name: "Certified Frame Degen",
    description: "Verified broke. But verified.",
    contract: "0x7cacb079e2c91e1e18a82f7a4a0fce3417dbfa4c",
    chain: "base",
    emoji: "🪙",
    bgClass: "from-blue-500 to-purple-600",
    imageUrl: "https://i.imgur.com/N08eGjt.png" // Sample coin/token image
  },
  // New NFTs from Zora
  {
    id: "think-last-mint-first",
    name: "Think Last Mint First",
    description: "Strategy? Never heard of her.",
    contract: "0xcf92ad51e860aa3b00d654cb91c6996a477a01a7",
    chain: "base",
    emoji: "🧠",
    bgClass: "from-pink-500 to-rose-600",
    imageUrl: "https://i.imgur.com/uuY6YUJ.png" // Brain themed illustration
  },
  {
    id: "based-until-rugged",
    name: "Based Until Rugged",
    description: "Held the line straight into the abyss.",
    contract: "0xc50a8c7c68c847ba6e5377cc846bbb1d1ccea0bc",
    chain: "base",
    emoji: "💎",
    bgClass: "from-indigo-500 to-blue-600",
    imageUrl: "https://i.imgur.com/9hGKsDQ.png" // Diamond hands illustration
  },
  {
    id: "gas-fee-victim",
    name: "Gas Fee Victim",
    description: "Died doing what I loved. Paying gas.",
    contract: "0x684fda8ec6707b723714586eac8f7ea6e6dec639",
    chain: "base",
    emoji: "⛽",
    bgClass: "from-red-500 to-orange-600",
    imageUrl: "https://i.imgur.com/Lnh9Icp.png" // Gas pump illustration
  },
  {
    id: "mint-or-die-trying",
    name: "Mint or Die Trying",
    description: "50 casts, zero regrets.",
    contract: "0xf801702a557c099d35e1da186ba2efb74221b020",
    chain: "base",
    emoji: "🎯",
    bgClass: "from-emerald-500 to-green-600",
    imageUrl: "https://i.imgur.com/bRYVHvT.png" // Target/bullseye illustration
  },
  {
    id: "frame-farmer-supreme",
    name: "Frame Farmer Supreme",
    description: "I cast more than I sleep.",
    contract: "0x4fbcd401338f98c17191fd3a3ae4671088a9089b",
    chain: "base",
    emoji: "🌾",
    bgClass: "from-amber-500 to-yellow-600",
    imageUrl: "https://i.imgur.com/nNv5srM.png" // Wheat/farming illustration
  },
  // Keep the other NFTs
  {
    id: "zora-nounish",
    name: "Zora Nounish NFT",
    description: "Fully on-chain generative artwork",
    contract: "0x5050E8348A4f3afD2f8aF9Cd3A43c31A63333950",
    chain: "zora",
    emoji: "👓",
    bgClass: "from-green-500 to-yellow-400",
    imageUrl: "https://i.imgur.com/C1S5VG9.png" // Nouns glasses illustration
  },
  {
    id: "base-defender",
    name: "Base Defender",
    description: "Early Base network supporter",
    contract: "0xBc12373d5B667a936DfD6C5Fc66E5f817d878bb0",
    chain: "base",
    emoji: "🛡️",
    bgClass: "from-indigo-600 to-blue-400",
    imageUrl: "https://i.imgur.com/wSnVX09.png" // Shield illustration
  }
];

// IPFS image URLs for the real NFTs
const REAL_NFT_IMAGES: Record<string, string> = {
  '0x7cacb079e2c91e1e18a82f7a4a0fce3417dbfa4c': 'https://ipfs.decentralized-content.com/ipfs/bafybeihbmin5tj7u4kin6yt634rierxssj7xrxypnprkochp5w4yvuagiq',
  '0xcf92ad51e860aa3b00d654cb91c6996a477a01a7': 'https://ipfs.decentralized-content.com/ipfs/bafybeifqej6e4jxk2r5mzft22vnxbyd3fqgaxk45ygrkvpnezomyh3aboi',
  '0xc50a8c7c68c847ba6e5377cc846bbb1d1ccea0bc': 'https://ipfs.decentralized-content.com/ipfs/bafybeiac5rcveaiu6rvytzhvt5srg7eeqz6j4b7qnftbvs4xqngcvwmwra',
  '0x684fda8ec6707b723714586eac8f7ea6e6dec639': 'https://ipfs.decentralized-content.com/ipfs/bafybeig6u2pkggiwx4vnvrrwfhuk64tx4rnbrwrxhb7u6rfnj5tgyuuxqm',
  '0xf801702a557c099d35e1da186ba2efb74221b020': 'https://ipfs.decentralized-content.com/ipfs/bafybeih7slqlad4iizbcpwxphlpifwcsogzyqpamjxnv4ldyzxzqnrl2hu',
  '0x4fbcd401338f98c17191fd3a3ae4671088a9089b': 'https://ipfs.decentralized-content.com/ipfs/bafybeig2cqs42rs3cod4kff4mi3vwkosltn5jajcjcchq76f77xmkqoheu'
};

const ZoraNFT: React.FC<ZoraNFTProps> = ({ txHash }) => {
  const { address } = useWallet();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;
  const [nftImages, setNftImages] = useState<Record<string, string>>(REAL_NFT_IMAGES);
  
  // Total pages calculation
  const totalPages = Math.ceil(NFT_DATA.length / itemsPerPage);
  
  // Current page of NFTs
  const currentNFTs = useMemo(() => {
    return NFT_DATA.slice(
      currentPage * itemsPerPage,
      (currentPage + 1) * itemsPerPage
    );
  }, [currentPage]);

  useEffect(() => {
    // Simulate loading the NFT data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Function to navigate between pages
  const changePage = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      // Reset selection to first item on the new page
      setSelected(newPage * itemsPerPage);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-48 h-48 bg-gray-300 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-600">{error}</p>
        <p className="text-sm text-red-500 mt-2">Please try again later</p>
      </div>
    );
  }

  const selectedNFT = NFT_DATA[selected];

  // Get the real NFT image URL if available, fallback to placeholder
  const getNFTImageUrl = (nft: NFT) => {
    return nftImages[nft.contract] || 
           nft.imageUrl || 
           `https://api.dicebear.com/7.x/shapes/svg?seed=${nft.id}&backgroundType=gradientLinear&backgroundColor=${nft.bgClass.replace('from-', '').replace('to-', '')}&width=600`;
  };

  return (
    <div className="p-6 bg-indigo-50 rounded-lg border border-indigo-200">
      <h3 className="text-lg font-semibold text-indigo-700 mb-4 text-center">Your NFT Collection</h3>
      
      {/* Selected NFT Display */}
      <div className="mb-6">
        <div className="w-full max-w-xs mx-auto bg-white rounded-lg overflow-hidden shadow-lg">
          <div 
            className="relative h-56 bg-gradient-to-r flex items-center justify-center text-center p-4 transition-all duration-500"
            style={{
              backgroundImage: `url(${getNFTImageUrl(selectedNFT)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: `rgba(${selectedNFT.id.charCodeAt(0) % 255}, ${selectedNFT.id.charCodeAt(1) % 255}, ${selectedNFT.id.charCodeAt(2) % 255}, 0.1)`
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            
            {/* NFT Themed Image/Symbol - Only show if we don't have the real image */}
            {!nftImages[selectedNFT.contract] && (
              <div className="z-10 flex flex-col items-center transform transition-transform duration-500">
                <div className="w-20 h-20 flex items-center justify-center bg-white bg-opacity-20 backdrop-blur-sm rounded-full mb-3 transition-all duration-500 hover:scale-110">
                  <span className="text-5xl">{selectedNFT.emoji}</span>
                </div>
                <span className="text-white font-bold text-xl drop-shadow-md transition-all duration-500">
                  {selectedNFT.name.toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-bold text-lg mb-1 transition-all duration-500">{selectedNFT.name}</h3>
            <p className="text-sm text-gray-600 mb-2 transition-all duration-500">{selectedNFT.description}</p>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Zora</span>
              <span>
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                {selectedNFT.chain === 'base' ? 'Base Sepolia' : 'Zora Sepolia'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* NFT Selection Grid */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {currentNFTs.map((nft, index) => (
          <div 
            key={nft.id}
            className={`cursor-pointer p-2 rounded-lg transition-all ${
              selected === currentPage * itemsPerPage + index 
                ? 'bg-white shadow-md ring-2 ring-indigo-400' 
                : 'bg-white/50 hover:bg-white hover:shadow-sm'
            }`}
            onClick={() => setSelected(currentPage * itemsPerPage + index)}
          >
            <div 
              className="h-16 rounded-md flex items-center justify-center mb-2 relative overflow-hidden"
              style={{
                backgroundImage: `url(${getNFTImageUrl(nft)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              {!nftImages[nft.contract] && (
                <span className="text-2xl relative z-10">{nft.emoji}</span>
              )}
            </div>
            <p className="text-xs font-medium text-center truncate">{nft.name}</p>
          </div>
        ))}
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mb-4">
          <button 
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-3 py-1 text-xs bg-white rounded border border-gray-200 disabled:opacity-50"
          >
            ← Prev
          </button>
          <span className="text-xs flex items-center">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button 
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="px-3 py-1 text-xs bg-white rounded border border-gray-200 disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}

      <p className="text-gray-700 mb-4 text-center">
        You&apos;ve received these NFTs proving your humanity verification status.
      </p>

      <div className="text-sm flex flex-col gap-2">
        {txHash && (
          <a
            href={`https://sepolia.basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 inline-flex items-center justify-center"
          >
            <span>View Verification Transaction</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
        <a
          href={`https://zora.co/coin/${selectedNFT.chain}:${selectedNFT.contract}?referrer=${address || '0x4c2d60f208f5217e4e8edc6af6cf47fc366329c9'}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-800 inline-flex items-center justify-center"
        >
          <span>View on Zora</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default ZoraNFT; 