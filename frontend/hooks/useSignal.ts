"use client";

import { useState } from "react";
import { useWalletClient, usePublicClient } from "wagmi";
import { getContractAddress } from "@/lib/viem-config";
import { PULSEERS_ABI } from "@/lib/contracts";
import { createWalletClient, custom } from "viem";
import { base } from "viem/chains";
import { sdk } from "@/lib/farcaster-sdk";
import { useWallet } from "@/hooks/useWallet";

/**
 * Universal Signal Hook
 * Works with:
 * - Browser wallets (MetaMask, Zerion, Rainbow, etc.)
 * - Coinbase Wallet / Smart Wallet
 * - Farcaster Mini App wallet (auto-detected)
 */
export function useSignal() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hash, setHash] = useState<string | null>(null);

  const { address, isFarcaster } = useWallet();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const signal = async (matchId: bigint, teamId: 1 | 2) => {
    setIsPending(true);
    setError(null);
    setIsSuccess(false);

    try {
      console.log("🎯 Submitting signal:", { matchId, teamId });

      // Use Farcaster wallet if detected, otherwise use regular wallet
      let clientToUse = walletClient;
      let accountToUse = address;

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

      console.log("👤 Using account:", accountToUse);

      const contractAddress = getContractAddress();
      console.log("📝 Contract:", contractAddress);

      if (!publicClient) {
        throw new Error("Public client not available");
      }

      // IMPORTANT: Transaction is always forced to Base Mainnet via chain: base parameter
      // For Farcaster wallet, we skip chain check (always Base Mainnet)
      // For regular wallets, we log but don't block
      if (!isFarcaster) {
        try {
          const chainId = await clientToUse.getChainId();
          console.log("🔗 Wallet Chain ID:", chainId);

          if (chainId === 84532) {
            console.warn("⚠️ Wallet reports Base Sepolia, but forcing Base Mainnet transaction");
          } else if (chainId !== 8453) {
            console.warn(`⚠️ Wallet reports Chain ID ${chainId}, but forcing Base Mainnet transaction`);
          } else {
            console.log("✅ Correct network: Base Mainnet");
          }
        } catch (err: any) {
          // Transaction will be forced to Base Mainnet anyway
          console.warn("⚠️ Could not verify wallet chain ID, but proceeding with Base Mainnet:", err);
        }
      } else {
        console.log("✅ Farcaster wallet - automatically on Base Mainnet");
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
