"use client";

import { useState } from "react";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { base } from "viem/chains";
import { getContractAddress } from "@/lib/viem-config";
import { PULSEERS_ABI } from "@/lib/contracts";
import { sdk } from "@/lib/farcaster-sdk";

/**
 * Hook to handle signaling with Farcaster SDK (Pattern from SeersLeague)
 * Uses direct Viem + Farcaster SDK for Mini App compatibility
 */
export function useSignal() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hash, setHash] = useState<string | null>(null);

  const signal = async (matchId: bigint, teamId: 1 | 2) => {
    setIsPending(true);
    setError(null);
    setIsSuccess(false);

    try {
      console.log("🎯 Submitting signal:", { matchId, teamId });

      let walletClient;
      let account: `0x${string}` | undefined;

      // Check if we're in Farcaster Mini App
      const isInMiniApp = await sdk.isInMiniApp();

      if (isInMiniApp) {
        // Use Farcaster SDK wallet
        console.log("📱 Running in Farcaster Mini App");

        const context = await sdk.context;
        console.log("👤 User context:", context.user);

        // Create wallet client with Farcaster wallet provider
        walletClient = createWalletClient({
          chain: base,
          transport: custom(sdk.wallet.ethProvider),
        });

        // Get account from wallet
        const [addr] = await walletClient.getAddresses();
        account = addr;
        console.log("✅ Account from Farcaster wallet:", account);
      } else if (typeof window !== "undefined" && (window as any).ethereum) {
        // Fallback to injected wallet (MetaMask, etc.)
        console.log("🦊 Using injected wallet");
        walletClient = createWalletClient({
          chain: base,
          transport: custom((window as any).ethereum),
        });

        const [addr] = await walletClient.getAddresses();
        account = addr;
      } else {
        throw new Error("No wallet found. Please connect your wallet or open in Farcaster Mini App.");
      }

      if (!account) {
        throw new Error("No account found. Please connect your wallet.");
      }

      console.log("👤 Using account:", account);

      const contractAddress = getContractAddress();
      console.log("📝 Contract:", contractAddress);

      // Prepare transaction
      const publicClient = createPublicClient({
        chain: base,
        transport: http(),
      });

      // Simulate transaction first
      console.log("🔍 Simulating transaction...");
      const { request } = await publicClient.simulateContract({
        address: contractAddress,
        abi: PULSEERS_ABI,
        functionName: "signal",
        args: [matchId, teamId],
        account,
      });

      console.log("✅ Simulation successful, sending transaction...");

      // Send transaction
      const txHash = await walletClient.writeContract(request);

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
