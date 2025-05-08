'use client';

import { FaTicketAlt } from 'react-icons/fa';

export default function RaffleEntry() {
  return (
    <div className="bg-base-light p-5 rounded-xl border border-base-blue shadow-inner text-center space-y-3">
      <div className="flex items-center justify-center text-base-blue text-2xl">
        <FaTicketAlt className="mr-2" />
        <span className="font-semibold">You've Been Entered Into The Raffle!</span>
      </div>
      <p className="text-base-dark text-sm">
        Thanks for verifying your humanity. You've secured a spot in our onchain raffle. Winners get surprise NFTs!
      </p>
      <a
        href="https://x.com/yourtweet" // <-- link to your raffle announcement or update post
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-2 bg-base-blue text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm"
      >
        View Raffle Details
      </a>
    </div>
  );
} 