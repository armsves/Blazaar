import React from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 text-white shadow-lg p-2">
      <div className="container mx-auto px-2 py-4">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <div className="flex-shrink-0 mr-8">
            <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent hover:scale-105 transition-transform">
              Blazaar
            </Link>
          </div>

          {/* Navigation - centered */}
          <nav className="flex-1 flex justify-center">
            <div className="flex items-center space-x-8">
              <Link href="/" className="hover:text-purple-300 transition-colors font-medium">
                Home
              </Link>
              <Link href="/marketplace" className="hover:text-purple-300 transition-colors font-medium">
                Marketplace
              </Link>
              <Link href="/launchpad" className="hover:text-purple-300 transition-colors font-medium">
                Launchpad
              </Link>
              <Link href="/staking" className="hover:text-purple-300 transition-colors font-medium">
                Staking
              </Link>
              <Link href="/factory" className="hover:text-purple-300 transition-colors font-medium">
                Factory
              </Link>
            </div>
          </nav>

          {/* Connect Wallet Button */}
          <div className="flex-shrink-0 ml-8">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;