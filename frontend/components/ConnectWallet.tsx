"use client";

import {
  ConnectWallet as OnchainKitConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { Address, Avatar, Name, Identity } from "@coinbase/onchainkit/identity";
import { useWallet } from "@/hooks/useWallet";
import { useEffect, useState } from "react";
import { sdk } from "@/lib/farcaster-sdk";

/**
 * Smart Wallet Component
 * - In Farcaster/BaseApp: Hides connect button (wallet auto-connected)
 * - In Browser: Shows OnchainKit connect button for MetaMask, Coinbase, etc.
 */
export function ConnectWallet() {
  const { isFarcasterAvailable, isFarcaster, isConnected } = useWallet();
  const [shouldShowConnect, setShouldShowConnect] = useState(true);

  useEffect(() => {
    const checkContext = async () => {
      try {
        const isInMiniApp = await sdk.isInMiniApp();
        const hasFarcasterWallet = !!(sdk.wallet?.ethProvider);
        const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

        // Hide connect button in Farcaster/BaseApp (wallet is auto-connected)
        if (isInMiniApp || (hasFarcasterWallet && isInIframe) || hasFarcasterWallet) {
          setShouldShowConnect(false);
        } else {
          // Show connect button in browser
          setShouldShowConnect(true);
        }
      } catch (error) {
        console.error("Error checking context:", error);
        // Default to showing connect button if check fails
        setShouldShowConnect(true);
      }
    };

    checkContext();
  }, []);

  // Don't show connect button in Farcaster/BaseApp
  if (!shouldShowConnect || (isFarcasterAvailable && isFarcaster)) {
    return null;
  }

  // Show connect button only in browser
  return (
    <Wallet>
      <OnchainKitConnectWallet className="!px-3 !py-2 !text-sm !font-semibold bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl shadow-lg transition-all" />
      <WalletDropdown>
        <Identity className="px-4 py-2 hover:bg-blue-50">
          <Avatar className="w-8 h-8" />
          <Name />
          <Address />
        </Identity>
        <WalletDropdownDisconnect className="hover:bg-red-50 text-red-600" />
      </WalletDropdown>
    </Wallet>
  );
}
