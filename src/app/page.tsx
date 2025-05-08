'use client';

import { WalletProvider } from '@/context/WalletContext';
import Captcha from '@/components/Captcha';

export default function Home() {
  return (
    <WalletProvider>
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              CAPTCHA-Free Verification
            </h1>
            <p className="text-xl text-gray-600">
              Skip the puzzles. Verify with a microtransaction instead.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                How It Works
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">1.</span>
                  <p>Connect your wallet and set up a sub-account</p>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">2.</span>
                  <p>Set a spend limit for CAPTCHA verifications</p>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">3.</span>
                  <p>Click once to verify - no more puzzles!</p>
                </li>
              </ul>
            </div>

            <div>
              <Captcha />
            </div>
          </div>
        </div>
      </main>
    </WalletProvider>
  );
}
