"use client";

import { useAccount as useWagmiAccount } from "wagmi";
import { useState, useEffect } from "react";
import { sdk } from "@/lib/farcaster-sdk";
import { createWalletClient, custom } from "viem";
import { base } from "viem/chains";

/**
 * Unified Wallet Hook
 * Detects and provides wallet connection state for:
 * - Farcaster/BaseApp wallet (automatic)
 * - Regular browser wallets (MetaMask, Coinbase, etc.)
 * 
 * In Farcaster/BaseApp: Automatically uses Farcaster wallet
 * In Browser: Uses wagmi connected wallets
 */
export function useWallet() {
  const { address: wagmiAddress, isConnected: wagmiConnected } = useWagmiAccount();
  const [farcasterAddress, setFarcasterAddress] = useState<string | null>(null);
  const [isFarcasterAvailable, setIsFarcasterAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Detect Farcaster/BaseApp wallet
  // This runs immediately on mount to detect Farcaster context
  useEffect(() => {
    const checkFarcaster = async () => {
      try {
        // Multiple detection methods for reliability
        const isInMiniApp = await sdk.isInMiniApp();
        const hasFarcasterWallet = !!(sdk.wallet?.ethProvider);
        const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
        
        // Additional Farcaster context checks
        const hasFarcasterContext = typeof window !== 'undefined' && (
          (window as any).farcaster ||
          (window as any).parent?.farcaster ||
          navigator.userAgent.includes('Farcaster')
        );

        // If ANY indicator suggests Farcaster/BaseApp, use Farcaster wallet
        const isFarcasterEnv = isInMiniApp || 
                              (hasFarcasterWallet && isInIframe) || 
                              hasFarcasterWallet ||
                              hasFarcasterContext;

        if (isFarcasterEnv) {
          setIsFarcasterAvailable(true);
          console.log("📱 Farcaster/BaseApp environment detected");
          
          try {
            // Get address from Farcaster wallet
            if (sdk.wallet?.ethProvider) {
              const walletClient = createWalletClient({
                chain: base,
                transport: custom(sdk.wallet.ethProvider),
              });

              const [addr] = await walletClient.getAddresses();
              if (addr) {
                setFarcasterAddress(addr);
                console.log("✅ Farcaster wallet address:", addr);
              }
            } else {
              console.warn("⚠️ Farcaster environment detected but wallet provider not available");
            }
          } catch (err) {
            console.warn("⚠️ Could not get Farcaster wallet address:", err);
          }
        } else {
          setIsFarcasterAvailable(false);
          console.log("🌐 Browser environment detected");
        }
      } catch (error) {
        console.error("Error checking Farcaster wallet:", error);
        setIsFarcasterAvailable(false);
      } finally {
        setIsChecking(false);
      }
    };

    // Run immediately
    checkFarcaster();
  }, []);

  // Determine active wallet
  const address = farcasterAddress || wagmiAddress || null;
  const isConnected = !!address;
  const isFarcaster = !!farcasterAddress;

  return {
    address,
    isConnected,
    isFarcaster,
    isFarcasterAvailable,
    isChecking,
    wagmiAddress,
    farcasterAddress,
  };
}
