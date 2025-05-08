'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useWallet } from '../context/WalletContext';
import Image from 'next/image';

interface NFT {
  id: string;
  name: string;
  description: string;
  contract: string;
  chain: string;
  emoji: string;
  bgClass: string;
  imageUrl: string; // URL for NFT image
}

interface ZoraNFTProps {
  txHash?: string;
}

// Convert IPFS URL to HTTP URL using a reliable gateway
const ipfsToHttp = (ipfsUrl: string): string => {
  if (!ipfsUrl.startsWith('ipfs://')) return ipfsUrl;
  
  // Remove ipfs:// prefix and any trailing slashes
  const cid = ipfsUrl.replace('ipfs://', '').replace(/\/$/, '');
  
  // Use multiple IPFS gateways for better reliability
  const gateways = [
    `https://ipfs.io/ipfs/${cid}`,
    `https://gateway.pinata.cloud/ipfs/${cid}`,
    `https://cloudflare-ipfs.com/ipfs/${cid}`,
    `https://dweb.link/ipfs/${cid}`
  ];
  
  // Return the first gateway URL (you could randomly select one for load balancing)
  return gateways[0];
};

// Define real NFT data with IPFS image URLs
const NFT_DATA: NFT[] = [
  {
    id: "certified-frame-degen",
    name: "Certified Frame Degen",
    description: "Verified broke. But verified.",
    contract: "0x7cacb079e2c91e1e18a82f7a4a0fce3417dbfa4c",
    chain: "base",
    emoji: "🪙",
    bgClass: "from-blue-500 to-purple-600",
    imageUrl: "ipfs://bafybeib73xypzrb3wf35ct2cjvs4kf5lzp6fc2kw6dagqla77uoyn6mi6e/"
  },
  {
    id: "think-last-mint-first",
    name: "Think Last Mint First",
    description: "Strategy? Never heard of her.",
    contract: "0xcf92ad51e860aa3b00d654cb91c6996a477a01a7",
    chain: "base",
    emoji: "🧠",
    bgClass: "from-pink-500 to-rose-600",
    imageUrl: "ipfs://bafybeiaiu2pwyobg5tuy2dgc6qu6ycg3ytj6vjb6su4pb7lfg3lwk4i7g4"
  },
  {
    id: "based-until-rugged",
    name: "Based Until Rugged",
    description: "Held the line straight into the abyss.",
    contract: "0xc50a8c7c68c847ba6e5377cc846bbb1d1ccea0bc",
    chain: "base",
    emoji: "💎",
    bgClass: "from-indigo-500 to-blue-600",
    imageUrl: "ipfs://bafybeiasufitpd4q3mbkg27d5n62ywomo7fwgre3orsk7rjvrspraik4jq"
  },
  {
    id: "gas-fee-victim",
    name: "Gas Fee Victim",
    description: "Died doing what I loved. Paying gas.",
    contract: "0x684fda8ec6707b723714586eac8f7ea6e6dec639",
    chain: "base",
    emoji: "⛽",
    bgClass: "from-red-500 to-orange-600",
    imageUrl: "ipfs://bafybeihbcpi44qekhmbyx7325uxe37e32lxap54mnwcly2r32tyvqgk43u"
  },
  {
    id: "mint-or-die-trying",
    name: "Mint or Die Trying",
    description: "50 casts, zero regrets.",
    contract: "0xf801702a557c099d35e1da186ba2efb74221b020",
    chain: "base",
    emoji: "🎯",
    bgClass: "from-emerald-500 to-green-600",
    imageUrl: "ipfs://bafybeiajfp5bfb7imkgtm456rcut3pkk7lbkerp357h76nyjh3nokyneje"
  },
  {
    id: "frame-farmer-supreme",
    name: "Frame Farmer Supreme",
    description: "I cast more than I sleep.",
    contract: "0x4fbcd401338f98c17191fd3a3ae4671088a9089b",
    chain: "base",
    emoji: "🌾",
    bgClass: "from-amber-500 to-yellow-600",
    imageUrl: "ipfs://bafybeiajowwybgvppddtpr2sxwfkazyzrs5aaw7z7cudin7zzohatv4jvu"
  },
  {
    id: "i-minted-it-anyway",
    name: "I Minted It Anyway",
    description: "Red flags? I saw them and minted harder.",
    contract: "0xbf0099de84ec528792fbd1c0aa45e2666636a33a",
    chain: "base",
    emoji: "🚩",
    bgClass: "from-rose-500 to-red-600",
    imageUrl: "ipfs://bafybeifr4khxjdvzhtm2c4hytwvpaozm65v3sa3efdyezcxth72snpwt6q"
  }
];

// Fallback image if IPFS fails
const FALLBACK_IMAGE = "https://svgur.com/i/12aD.svg";

const ZoraNFT: React.FC<ZoraNFTProps> = ({ txHash }) => {
  const { address } = useWallet();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const itemsPerPage = 4;
  
  // Total pages calculation
  const totalPages = Math.ceil(NFT_DATA.length / itemsPerPage);
  
  // Current page of NFTs
  const currentNFTs = useMemo(() => {
    return NFT_DATA.slice(
      currentPage * itemsPerPage,
      (currentPage + 1) * itemsPerPage
    );
  }, [currentPage]);

  // Preload all images
  useEffect(() => {
    NFT_DATA.forEach(nft => {
      const img = document.createElement('img');
      img.src = ipfsToHttp(nft.imageUrl);
      img.onerror = () => {
        setImageErrors(prev => ({ ...prev, [nft.id]: true }));
      };
    });
  }, []);

  useEffect(() => {
    // Simulate loading the NFT data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    
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

  // Handle image load errors
  const handleImageError = (nftId: string) => {
    setImageErrors(prev => ({ ...prev, [nftId]: true }));
  };

  // Get image URL with fallback
  const getImageUrl = (nft: NFT) => {
    return imageErrors[nft.id] ? `${FALLBACK_IMAGE}?seed=${nft.id}` : ipfsToHttp(nft.imageUrl);
  };

  // Create background color based on NFT id for fallbacks
  const getBgColor = (nftId: string) => {
    const hue = (nftId.charCodeAt(0) + nftId.charCodeAt(1)) % 360;
    return `hsl(${hue}, 70%, 80%)`;
  };

  if (loading) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-48 h-48 bg-gray-300 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
        <p className="mt-4 text-sm text-gray-500">Loading your verified NFTs...</p>
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

  return (
    <div className="p-6 bg-indigo-50 rounded-lg border border-indigo-200">
      <h3 className="text-lg font-semibold text-indigo-700 mb-4 text-center">Your NFT Collection</h3>
      
      {/* Selected NFT Display */}
      <div className="mb-6">
        <div className="w-full max-w-xs mx-auto bg-white rounded-lg overflow-hidden shadow-md">
          <div 
            className="relative h-64 w-full" 
            style={{ backgroundColor: getBgColor(selectedNFT.id) }}
          >
            <img
              src={getImageUrl(selectedNFT)}
              alt={selectedNFT.name}
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => handleImageError(selectedNFT.id)}
            />
            {imageErrors[selectedNFT.id] && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl">{selectedNFT.emoji}</span>
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-bold text-lg mb-1 text-blue-600">{selectedNFT.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{selectedNFT.description}</p>
            <div className="flex justify-between items-center text-xs mb-3">
              <span className="text-blue-600 font-medium">Zora</span>
              <span className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                Base
              </span>
            </div>
            
            {/* Direct Zora links for selected NFT */}
            <div className="flex flex-col space-y-2">
              <a
                href={`https://zora.co/coin/base:${selectedNFT.contract}${address ? `?referrer=${address}` : ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-md transition-colors duration-200 font-medium"
              >
                View on Zora
              </a>
              <a
                href={`https://zora.co/collect/base:${selectedNFT.contract}${address ? `?referrer=${address}` : ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-2 rounded-md transition-colors duration-200 font-medium"
              >
                Buy on Zora
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* NFT Selection Grid */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {currentNFTs.map((nft, index) => (
          <div 
            key={nft.id}
            className={`cursor-pointer rounded-lg transition-all duration-150 ${
              selected === currentPage * itemsPerPage + index 
                ? 'bg-white shadow-md ring-2 ring-blue-400' 
                : 'bg-white/50 hover:bg-white hover:shadow-sm'
            }`}
            onClick={() => setSelected(currentPage * itemsPerPage + index)}
          >
            <div 
              className="relative h-16 w-full rounded-t-lg overflow-hidden group" 
              style={{ backgroundColor: getBgColor(nft.id) }}
            >
              <img 
                src={getImageUrl(nft)}
                alt={nft.name}
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => handleImageError(nft.id)} 
              />
              {imageErrors[nft.id] && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">{nft.emoji}</span>
                </div>
              )}
              
              {/* Quick view overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                <a
                  href={`https://zora.co/coin/base:${nft.contract}${address ? `?referrer=${address}` : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
                  onClick={(e) => e.stopPropagation()} // Prevent triggering the parent onClick
                >
                  View
                </a>
              </div>
            </div>
            <p className="text-xs font-medium text-center p-2 truncate text-blue-600">{nft.name}</p>
          </div>
        ))}
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mb-4">
          <button 
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-3 py-1 text-xs bg-white rounded-full border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            ← Prev
          </button>
          <span className="text-xs flex items-center">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button 
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="px-3 py-1 text-xs bg-white rounded-full border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            Next →
          </button>
        </div>
      )}

      <p className="text-gray-700 mb-4 text-center text-sm">
        These NFTs were airdropped to your wallet after verifying your humanity.
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
      </div>
    </div>
  );
};

export default ZoraNFT; 