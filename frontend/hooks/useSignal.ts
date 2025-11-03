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

      let clientToUse = walletClient;
      let accountToUse = address;

      // Check if we're in Farcaster Mini App and no regular wallet is connected
      if (!walletClient) {
        const isInMiniApp = await sdk.isInMiniApp();

        if (isInMiniApp) {
          console.log("📱 Using Farcaster Mini App wallet");
          const context = await sdk.context;
          console.log("👤 Farcaster user:", context.user);

          // Create wallet client with Farcaster SDK
          clientToUse = createWalletClient({
            chain: base,
            transport: custom(sdk.wallet.ethProvider),
          });

          const [addr] = await clientToUse.getAddresses();
          accountToUse = addr;
          console.log("✅ Farcaster account:", accountToUse);
        } else {
          throw new Error("Please connect your wallet to signal");
        }
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

      // Simulate transaction first
      console.log("🔍 Simulating transaction...");
      const { request } = await publicClient.simulateContract({
        address: contractAddress,
        abi: PULSEERS_ABI,
        functionName: "signal",
        args: [matchId, teamId],
        account: accountToUse,
      });

      console.log("✅ Simulation successful, sending transaction...");

      // Send transaction
      const txHash = await clientToUse.writeContract(request);

      console.log("📤 Transaction sent:", txHash);
      setHash(txHash);

      // Wait for confirmation
      console.log("⏳ Waiting for confirmation...");
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        confirmations: 1,
      });

      console.log("✅ Transaction confirmed:", receipt);

      setIsSuccess(true);
      setIsPending(false);

      return txHash;
    } catch (err: any) {
      console.error("❌ Signal error:", err);
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
