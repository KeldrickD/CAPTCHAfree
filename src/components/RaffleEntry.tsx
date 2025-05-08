'use client';

import { FaTicketAlt, FaGift, FaCalendarAlt } from 'react-icons/fa';
import Image from 'next/image';
import React from 'react';

// Convert IPFS URL to HTTP URL using a reliable gateway
const ipfsToHttp = (ipfsUrl: string): string => {
  if (!ipfsUrl.startsWith('ipfs://')) {
    // If it's a CID without ipfs:// prefix
    if (!ipfsUrl.includes('/') && !ipfsUrl.includes('http')) {
      const cid = ipfsUrl;
      return `https://ipfs.io/ipfs/${cid}`;
    }
    return ipfsUrl;
  }
  
  // Remove ipfs:// prefix and any trailing slashes
  const cid = ipfsUrl.replace('ipfs://', '').replace(/\/$/, '');
  
  // Use multiple IPFS gateways for better reliability
  const gateways = [
    `https://ipfs.io/ipfs/${cid}`,
    `https://gateway.pinata.cloud/ipfs/${cid}`,
    `https://cloudflare-ipfs.com/ipfs/${cid}`,
    `https://dweb.link/ipfs/${cid}`
  ];
  
  // Return the first gateway URL
  return gateways[0];
};

export default function RaffleEntry() {
  const nftCid = "bafybeictqsimswrvgkbqpi6cybhrbnt7pcyxf74nsiskljrhklkhqdpoeu";
  const nftImageUrl = ipfsToHttp(nftCid);

  return (
    <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-200 shadow-inner text-center space-y-5">
      <div className="flex items-center justify-center text-indigo-700 text-2xl">
        <FaTicketAlt className="mr-2" />
        <span className="font-semibold">You've Been Entered Into The Raffle!</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-indigo-700 mb-3">Raffle Rules</h3>
          <ul className="text-sm text-left space-y-2">
            <li className="flex items-start">
              <FaGift className="text-green-600 mt-1 mr-2 flex-shrink-0" />
              <span><strong>Prize:</strong> 0.01 ETH or Rare Bonus NFT</span>
            </li>
            <li className="flex items-start">
              <FaTicketAlt className="text-blue-600 mt-1 mr-2 flex-shrink-0" />
              <span><strong>Entry:</strong> Every mint = 1 raffle ticket</span>
            </li>
            <li className="flex items-start">
              <FaCalendarAlt className="text-purple-600 mt-1 mr-2 flex-shrink-0" />
              <span><strong>Draw:</strong> After X mints or X days (public announcement)</span>
            </li>
          </ul>
          
          <a
            href="https://twitter.com/intent/tweet?text=I%20just%20verified%20my%20humanity%20with%20%40captchafree%20and%20entered%20the%20raffle%21"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm"
          >
            Share on Twitter
          </a>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-blue-600 mb-2">The Final Mint Boss</h3>
          <div className="relative h-40 w-full mb-2 bg-gray-100 rounded overflow-hidden">
            <img 
              src={nftImageUrl}
              alt="The Final Mint Boss NFT"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement;
                target.src = "https://svgur.com/i/12aD.svg";
              }}
            />
          </div>
          <p className="text-sm text-gray-600 italic">
            "You minted 10 memes... now face the final boss."
          </p>
        </div>
      </div>
    </div>
  );
} 