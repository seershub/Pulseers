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
 * - In Farcaster/BaseApp: Hides connect button completely (wallet auto-connected)
 * - In Browser: Shows OnchainKit connect button for MetaMask, Coinbase, etc.
 * 
 * CRITICAL: This component must NEVER render OnchainKit Wallet in Farcaster/BaseApp
 * because it will try to open Base Wallet popup, which is not desired.
 */
export function ConnectWallet() {
  const { isFarcasterAvailable, isFarcaster, isConnected, isChecking } = useWallet();
  const [shouldShowConnect, setShouldShowConnect] = useState(false); // Start with false to prevent flash
  const [isInFarcasterContext, setIsInFarcasterContext] = useState(false);

  useEffect(() => {
    const checkContext = async () => {
      try {
        // Multiple detection methods for maximum reliability
        const isInMiniApp = await sdk.isInMiniApp();
        const hasFarcasterWallet = !!(sdk.wallet?.ethProvider);
        const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
        
        // Check for Farcaster-specific user agent or window properties
        const hasFarcasterContext = typeof window !== 'undefined' && (
          (window as any).farcaster ||
          (window as any).parent?.farcaster ||
          navigator.userAgent.includes('Farcaster')
        );

        // If ANY indicator suggests Farcaster/BaseApp, hide connect button
        const inFarcasterBaseApp = isInMiniApp || 
                                   (hasFarcasterWallet && isInIframe) || 
                                   hasFarcasterWallet ||
                                   hasFarcasterContext;

        setIsInFarcasterContext(inFarcasterBaseApp);

        if (inFarcasterBaseApp) {
          console.log("🚫 Farcaster/BaseApp detected - hiding ConnectWallet button");
          setShouldShowConnect(false);
        } else {
          console.log("✅ Browser detected - showing ConnectWallet button");
          setShouldShowConnect(true);
        }
      } catch (error) {
        console.error("Error checking context:", error);
        // If check fails, assume browser (safer to show than hide)
        setIsInFarcasterContext(false);
        setShouldShowConnect(true);
      }
    };

    checkContext();
  }, []);

  // CRITICAL: Never show OnchainKit Wallet in Farcaster/BaseApp
  // This prevents Base Wallet popup from appearing
  if (isInFarcasterContext || 
      (isFarcasterAvailable && isFarcaster) || 
      (!shouldShowConnect && !isChecking)) {
    // Return null - completely hide the component
    return null;
  }

  // Only show in browser when we're sure we're not in Farcaster/BaseApp
  if (!shouldShowConnect || isChecking) {
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
