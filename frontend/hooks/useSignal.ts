"use client";

import { useState } from "react";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { base } from "viem/chains";
import { getContractAddress } from "@/lib/viem-config";
import { PULSEERS_ABI } from "@/lib/contracts";

/**
 * Hook to handle signaling with MiniKit SDK (Pattern from SeersLeague)
 * Uses direct Viem instead of Wagmi for better Mini App compatibility
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

      // Check if we're in MiniKit environment
      const minikit = typeof window !== "undefined" ? (window as any).minikit : null;

      let walletClient;

      if (minikit?.wallet?.ethProvider) {
        // Use MiniKit wallet
        console.log("📱 Using MiniKit wallet");
        walletClient = createWalletClient({
          chain: base,
          transport: custom(minikit.wallet.ethProvider),
        });
      } else if (typeof window !== "undefined" && (window as any).ethereum) {
        // Fallback to injected wallet
        console.log("🦊 Using injected wallet");
        walletClient = createWalletClient({
          chain: base,
          transport: custom((window as any).ethereum),
        });
      } else {
        throw new Error("No wallet found. Please connect your wallet.");
      }

      const [account] = await walletClient.getAddresses();

      if (!account) {
        throw new Error("No account found. Please connect your wallet.");
      }

      console.log("👤 Account:", account);

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
