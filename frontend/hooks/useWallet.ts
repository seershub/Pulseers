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
  useEffect(() => {
    const checkFarcaster = async () => {
      try {
        const isInMiniApp = await sdk.isInMiniApp();
        const hasFarcasterWallet = !!(sdk.wallet?.ethProvider);
        const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

        if (isInMiniApp || (hasFarcasterWallet && isInIframe) || hasFarcasterWallet) {
          setIsFarcasterAvailable(true);
          
          try {
            // Get address from Farcaster wallet
            const walletClient = createWalletClient({
              chain: base,
              transport: custom(sdk.wallet.ethProvider),
            });

            const [addr] = await walletClient.getAddresses();
            if (addr) {
              setFarcasterAddress(addr);
              console.log("✅ Farcaster wallet detected:", addr);
            }
          } catch (err) {
            console.warn("⚠️ Could not get Farcaster wallet address:", err);
          }
        } else {
          setIsFarcasterAvailable(false);
        }
      } catch (error) {
        console.error("Error checking Farcaster wallet:", error);
        setIsFarcasterAvailable(false);
      } finally {
        setIsChecking(false);
      }
    };

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
