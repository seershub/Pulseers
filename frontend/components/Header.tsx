"use client";

import { useWallet } from "@/hooks/useWallet";
import { ConnectWallet } from "./ConnectWallet";
import { User, History, Trophy } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function Header() {
  const { address, isConnected, isFarcasterAvailable, isChecking } = useWallet();
  const pathname = usePathname();
  
  // In Farcaster/BaseApp, show navigation even while address is loading
  const showNavigation = isConnected || (isFarcasterAvailable && !isChecking);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="header-glass sticky top-0 z-50 safe-area-top">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg group-hover:scale-110 transition-transform">
              <Image
                src="/icon-512.png"
                alt="Pulseers Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-black gradient-text">Pulseers</h1>
              <p className="text-xs text-gray-500 font-medium">Signal Your Team</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/"
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                pathname === "/"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "text-gray-600 hover:bg-blue-50"
              }`}
            >
              Matches
            </Link>
            {showNavigation && (
              <>
                <Link
                  href="/profile"
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    pathname === "/profile"
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-600 hover:bg-blue-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profile
                  </span>
                </Link>
                <Link
                  href="/history"
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    pathname === "/history"
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-600 hover:bg-blue-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <History className="w-4 h-4" />
                    History
                  </span>
                </Link>
              </>
            )}
          </nav>

          {/* Wallet Connection - Compact */}
          <div className="flex items-center gap-2">
            {isConnected && address && (
              <>
                {/* Wallet Address - Compact display */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-blue-700 font-mono">
                    {formatAddress(address)}
                  </span>
                </div>
                {/* In browser, show ConnectWallet dropdown for disconnect */}
                {/* In Farcaster/BaseApp, wallet is auto-connected and cannot be disconnected */}
                {!isFarcasterAvailable && (
                  <ConnectWallet />
                )}
              </>
            )}
            {/* ConnectWallet only shows in browser when not connected */}
            {!isConnected && <ConnectWallet />}
          </div>
        </div>

        {/* Mobile Navigation - Compact Icon-Based */}
        {showNavigation && (
          <nav className="md:hidden flex items-center justify-center gap-1 mt-3">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                pathname === "/"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-blue-50"
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              Matches
            </Link>
            <Link
              href="/profile"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                pathname === "/profile"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-blue-50"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Profile
            </Link>
            <Link
              href="/history"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                pathname === "/history"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-blue-50"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              History
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
