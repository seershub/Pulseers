"use client";

import { useState } from "react";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { getContractAddress } from "@/lib/viem-config";
import { PULSEERS_ABI } from "@/lib/contracts";
import { createWalletClient, custom } from "viem";
import { base } from "viem/chains";
import { sdk } from "@/lib/farcaster-sdk";

/**
 * Universal Signal Hook
 * Works with:
 * - Browser wallets (MetaMask, Zerion, Rainbow, etc.)
 * - Coinbase Wallet / Smart Wallet
 * - Farcaster Mini App wallet
 */
export function useSignal() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hash, setHash] = useState<string | null>(null);

  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const signal = async (matchId: bigint, teamId: 1 | 2) => {
    setIsPending(true);
    setError(null);
    setIsSuccess(false);

    try {
      console.log("🎯 Submitting signal:", { matchId, teamId });

      // CRITICAL: Check if we're in Farcaster/BaseApp FIRST
      // BaseApp/Farcaster always uses Base Mainnet, so we prioritize Farcaster wallet
      let clientToUse = walletClient;
      let accountToUse = address;
      let isFarcasterWallet = false;
      let isInBaseApp = false;

      // Always check if we're in Farcaster/BaseApp context
      // Check multiple ways to ensure we detect BaseApp even if isInMiniApp() fails
      try {
        // Method 1: Check isInMiniApp()
        const isInMiniApp = await sdk.isInMiniApp();
        
        // Method 2: Check if Farcaster wallet provider is available
        const hasFarcasterWallet = !!(sdk.wallet?.ethProvider);
        
        // Method 3: Check if we're in an iframe (BaseApp runs in iframe)
        const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
        
        // If any indicator suggests we're in BaseApp/Farcaster, use Farcaster wallet
        if (isInMiniApp || (hasFarcasterWallet && isInIframe) || hasFarcasterWallet) {
          isInBaseApp = true;
          isFarcasterWallet = true;
          console.log("📱 Detected Farcaster/BaseApp - using Farcaster wallet", {
            isInMiniApp,
            hasFarcasterWallet,
            isInIframe
          });
          
          try {
            const context = await sdk.context;
            console.log("👤 Farcaster user:", context.user);

            // Always use Farcaster wallet when in BaseApp/Farcaster
            // This ensures we're always on Base Mainnet
            if (sdk.wallet?.ethProvider) {
              clientToUse = createWalletClient({
                chain: base,
                transport: custom(sdk.wallet.ethProvider),
              });

              const [addr] = await clientToUse.getAddresses();
              accountToUse = addr;
              console.log("✅ Farcaster account:", accountToUse);
            } else {
              throw new Error("Farcaster wallet provider not available");
            }
          } catch (err) {
            console.error("❌ Failed to initialize Farcaster wallet:", err);
            // If Farcaster wallet fails, fall back to regular wallet
            isFarcasterWallet = false;
            isInBaseApp = false;
          }
        }
      } catch (err) {
        console.warn("⚠️ Could not check Farcaster context:", err);
      }

      // If not in Farcaster/BaseApp and no wallet connected, throw error
      if (!isFarcasterWallet && !walletClient) {
        throw new Error("Please connect your wallet to signal");
      }

      if (!clientToUse || !accountToUse) {
        throw new Error("No wallet connected");
      }

      console.log("👤 Using account:", accountToUse);

      const contractAddress = getContractAddress();
      console.log("📝 Contract:", contractAddress);

      if (!publicClient) {
        throw new Error("Public client not available");
      }

      // IMPORTANT: In BaseApp/Farcaster, we ALWAYS use Base Mainnet
      // For regular wallets, we check chain but don't block if detection fails
      // The transaction will be forced to Base Mainnet via chain: base parameter
      if (!isFarcasterWallet && !isInBaseApp) {
        try {
          const chainId = await clientToUse.getChainId();
          console.log("🔗 Wallet Chain ID:", chainId);

          if (chainId === 84532) {
            console.warn("⚠️ Wallet reports Base Sepolia, but forcing Base Mainnet transaction");
            // Don't throw - viem will force Base Mainnet via chain parameter
          } else if (chainId !== 8453) {
            console.warn(`⚠️ Wallet reports Chain ID ${chainId}, but forcing Base Mainnet transaction`);
            // Don't throw - viem will force Base Mainnet via chain parameter
          } else {
            console.log("✅ Correct network: Base Mainnet");
          }
        } catch (err: any) {
          // If we can't verify chain, warn but don't block
          // Transaction will be forced to Base Mainnet anyway
          console.warn("⚠️ Could not verify wallet chain ID, but proceeding with Base Mainnet:", err);
        }
      } else {
        console.log("✅ BaseApp/Farcaster wallet - automatically on Base Mainnet");
      }

      // Send transaction directly without simulation
      console.log("📤 Sending transaction to Base Mainnet...");

      const txHash = await clientToUse.writeContract({
        address: contractAddress,
        abi: PULSEERS_ABI,
        functionName: "signal",
        args: [matchId, teamId],
        account: accountToUse,
        chain: base,
      });

      console.log("✅ Transaction sent successfully!");
      console.log("📤 TX Hash:", txHash);
      console.log("🔍 View on BaseScan: https://basescan.org/tx/" + txHash);
      setHash(txHash);

      // Wait for confirmation
      console.log("⏳ Waiting for confirmation on Base Mainnet...");
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        confirmations: 1,
        timeout: 60_000, // 60 seconds timeout
      });

      console.log("✅ Transaction confirmed!");
      console.log("📋 Receipt:", receipt);
      console.log("🔍 BaseScan: https://basescan.org/tx/" + txHash);

      setIsSuccess(true);
      setIsPending(false);

      return txHash;
    } catch (err: any) {
      console.error("❌ Signal error:", err);
      console.error("❌ Error details:", {
        message: err.message,
        code: err.code,
        data: err.data,
      });
      setError(err);
      setIsPending(false);
      setIsSuccess(false);
      throw err;
    }
  };

  return {
    signal,
    isPending,
    isSuccess,
    error,
    hash,
  };
}
