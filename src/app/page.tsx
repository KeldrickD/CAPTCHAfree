'use client';

import { WalletProvider } from '../context/WalletContext';
import { useState } from 'react';
import Captcha from '../components/Captcha';

export default function Home() {
  const [isVerified, setIsVerified] = useState(false);

  const handleVerification = () => {
    setIsVerified(true);
  };

  return (
    <WalletProvider>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                CAPTCHAfree
              </h1>
              <p className="text-lg text-gray-600">
                Skip CAPTCHAs with on-chain microtransactions
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              {!isVerified ? (
                <div>
                  <Captcha onSolve={handleVerification} />
                </div>
              ) : (
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <h2 className="text-2xl font-bold text-green-700 mb-4">
                    🎉 Welcome, Verified Human!
                  </h2>
                  <p className="text-gray-700 mb-6">
                    You now have access to all protected content.
                  </p>
                  <div className="grid gap-6">
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <h3 className="font-bold text-lg mb-2">🔒 Protected Content</h3>
                      <p className="text-gray-600">
                        This content is only visible to verified humans.
                      </p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <h3 className="font-bold text-lg mb-2">🎁 Bonus Features</h3>
                      <p className="text-gray-600">
                        Enjoy exclusive access to special features and content.
                      </p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <h3 className="font-bold text-lg mb-2">🌟 Premium Access</h3>
                      <p className="text-gray-600">
                        Experience the web without interruptions.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </WalletProvider>
  );
}
