"use client";

import { useState } from "react";
import { useWalletClient, usePublicClient, useSwitchChain } from "wagmi";
import { getContractAddress } from "@/lib/viem-config";
import { PULSEERS_ABI } from "@/lib/contracts";
import { createWalletClient, custom, type Account } from "viem";
import { base } from "viem/chains";
import { sdk } from "@/lib/farcaster-sdk";
import { useWallet } from "@/hooks/useWallet";

/**
 * Universal Signal Hook
 * Works with:
 * - Browser wallets (MetaMask, Zerion, Rainbow, etc.)
 * - Coinbase Wallet / Smart Wallet
 * - Farcaster Mini App wallet (auto-detected)
 *
 * AUTO-SWITCHES to Base Mainnet if wallet is on wrong chain
 */
export function useSignal() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hash, setHash] = useState<string | null>(null);

  const { address, isFarcaster } = useWallet();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { switchChainAsync } = useSwitchChain();

  const signal = async (matchId: bigint, teamId: 1 | 2) => {
    setIsPending(true);
    setError(null);
    setIsSuccess(false);

    try {
      console.log("🎯 Submitting signal:", { matchId, teamId });

      // Use Farcaster wallet if detected, otherwise use regular wallet
      let clientToUse = walletClient;
      let accountToUse: `0x${string}` | Account | null = address ? (address as `0x${string}`) : null;

      // If useWallet detected Farcaster wallet, use it
      if (isFarcaster && sdk.wallet?.ethProvider) {
        console.log("📱 Using Farcaster wallet from useWallet hook");
        try {
          clientToUse = createWalletClient({
            chain: base,
            transport: custom(sdk.wallet.ethProvider),
          });

          const [addr] = await clientToUse.getAddresses();
          accountToUse = addr;
          console.log("✅ Farcaster account:", accountToUse);
        } catch (err) {
          console.error("❌ Failed to initialize Farcaster wallet:", err);
          // Fall back to regular wallet if Farcaster fails
          if (!walletClient) {
            throw new Error("No wallet available");
          }
        }
      } else if (!walletClient) {
        // If no Farcaster wallet and no regular wallet, throw error
        throw new Error("Please connect your wallet to signal");
      }

      if (!clientToUse || !accountToUse) {
        throw new Error("No wallet connected");
      }

      // Type guard: ensure accountToUse is not null
      if (!accountToUse) {
        throw new Error("No wallet account available");
      }

      console.log("👤 Using account:", accountToUse);

      const contractAddress = getContractAddress();
      console.log("📝 Contract:", contractAddress);

      if (!publicClient) {
        throw new Error("Public client not available");
      }

      // CRITICAL: Check chain and switch if needed (for non-Farcaster wallets)
      if (!isFarcaster && clientToUse) {
        try {
          const chainId = await clientToUse.getChainId();
          console.log("🔗 Current Wallet Chain ID:", chainId);
          console.log("🎯 Target Chain ID:", base.id, "(Base Mainnet)");

          if (chainId !== base.id) {
            console.log(`⚠️ Wrong network! Switching from chain ${chainId} to Base Mainnet (${base.id})...`);

            // Ask user to switch network
            try {
              await switchChainAsync({ chainId: base.id });
              console.log("✅ Successfully switched to Base Mainnet");
            } catch (switchError: any) {
              console.error("❌ Failed to switch network:", switchError);
              throw new Error(
                `Please switch your wallet to Base Mainnet. Current: Chain ${chainId}, Required: Base Mainnet (${base.id})`
              );
            }
          } else {
            console.log("✅ Already on Base Mainnet");
          }
        } catch (err: any) {
          if (err.message?.includes("switch")) {
            throw err; // Re-throw switch errors
          }
          console.warn("⚠️ Could not verify wallet chain ID:", err.message);
        }
      } else {
        console.log("✅ Farcaster wallet - automatically on Base Mainnet");
      }

      // Send transaction directly
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
