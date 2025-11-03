"use client";

import { useAccount } from "wagmi";
import { ConnectWallet } from "./ConnectWallet";
import { User, History } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function Header() {
  const { address, isConnected } = useAccount();
  const pathname = usePathname();

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
            {isConnected && (
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

          {/* Wallet Connection */}
          <div className="flex items-center gap-3">
            {isConnected && address && (
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-blue-700">
                  {formatAddress(address)}
                </span>
              </div>
            )}
            <ConnectWallet />
          </div>
        </div>

        {/* Mobile Navigation */}
        {isConnected && (
          <nav className="md:hidden flex items-center gap-2 mt-4 overflow-x-auto pb-2">
            <Link
              href="/"
              className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                pathname === "/"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "text-gray-600 bg-white"
              }`}
            >
              Matches
            </Link>
            <Link
              href="/profile"
              className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                pathname === "/profile"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "text-gray-600 bg-white"
              }`}
            >
              Profile
            </Link>
            <Link
              href="/history"
              className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                pathname === "/history"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "text-gray-600 bg-white"
              }`}
            >
              History
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
