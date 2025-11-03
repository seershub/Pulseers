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

      // CRITICAL: Verify chain - MUST be Base Mainnet
      try {
        const chainId = await clientToUse.getChainId();
        console.log("🔗 Wallet Chain ID:", chainId);

        if (chainId === 84532) {
          throw new Error(
            "❌ Wrong Network!\n\n" +
            "Your wallet is on Base Sepolia (Testnet).\n" +
            "Please switch to Base Mainnet in your wallet.\n\n" +
            "Current: Base Sepolia (84532)\n" +
            "Required: Base Mainnet (8453)"
          );
        }

        if (chainId !== 8453) {
          throw new Error(
            "❌ Wrong Network!\n\n" +
            "Please switch to Base Mainnet in your wallet.\n\n" +
            `Current Chain ID: ${chainId}\n` +
            "Required: Base Mainnet (8453)"
          );
        }

        console.log("✅ Correct network: Base Mainnet");
      } catch (err: any) {
        // If it's our custom error, throw it
        if (err.message?.includes("Wrong Network")) {
          throw err;
        }
        // If we can't verify chain, warn but don't block
        console.warn("⚠️ Could not verify wallet chain ID:", err);
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
