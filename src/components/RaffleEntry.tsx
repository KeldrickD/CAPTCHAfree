'use client';

import { FaTicketAlt, FaGift, FaCalendarAlt, FaPlus } from 'react-icons/fa';
import Image from 'next/image';
import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';

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
  const { sendTransaction, address } = useWallet();
  const [buyingTicket, setBuyingTicket] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);

  const handleBuyTicket = async () => {
    try {
      setBuyingTicket(true);
      setTicketError(null);
      
      // Send a transaction to purchase a raffle ticket - same amount as verification (0.001 ETH)
      const txHash = await sendTransaction(
        // Send to the zero address (or you could use a specific raffle collection address)
        '0x0000000000000000000000000000000000000000',
        '0.001'
      );
      
      console.log('Raffle ticket purchased, txHash:', txHash);
      setTicketSuccess(true);
      
      // Reset success message after 5 seconds
      setTimeout(() => setTicketSuccess(false), 5000);
      
    } catch (error) {
      console.error('Failed to buy raffle ticket:', error);
      setTicketError(error instanceof Error ? error.message : 'Transaction failed');
    } finally {
      setBuyingTicket(false);
    }
  };

  return (
    <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-200 shadow-inner text-center space-y-5">
      <div className="flex items-center justify-center text-indigo-700 text-2xl">
        <FaTicketAlt className="mr-2" />
        <span className="font-semibold">You've Been Entered Into The Raffle!</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-indigo-700 mb-3">Raffle Rules</h3>
          <ul className="text-sm text-left space-y-2 text-gray-800 font-medium">
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
              <span><strong>Draw:</strong> After 100 mints or May 30th (whichever comes first)</span>
            </li>
          </ul>
          
          <div className="mt-4 space-y-2">
            <a
              href="https://twitter.com/intent/tweet?text=I%20just%20verified%20my%20humanity%20with%20%40captchafree%20and%20entered%20the%20raffle%21"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm"
            >
              Share on Twitter
            </a>
            
            <button
              onClick={handleBuyTicket}
              disabled={buyingTicket}
              className="inline-block w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-sm flex items-center justify-center"
            >
              {buyingTicket ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Buying Ticket...
                </>
              ) : (
                <>
                  <FaPlus className="mr-2" />
                  Buy Additional Ticket (0.001 ETH)
                </>
              )}
            </button>
            
            {ticketSuccess && (
              <div className="bg-green-100 text-green-800 text-sm p-2 rounded animate-pulse">
                Ticket purchased successfully! Your chances just increased.
              </div>
            )}
            
            {ticketError && (
              <div className="bg-red-100 text-red-800 text-xs p-2 rounded">
                {ticketError}
              </div>
            )}
          </div>
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