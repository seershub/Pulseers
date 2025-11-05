"use client";

import { useState } from "react";
import { useWalletClient, usePublicClient } from "wagmi";
import { getContractAddress } from "@/lib/viem-config";
import { PULSEERS_ABI } from "@/lib/contracts";
import { createWalletClient, custom, type Account } from "viem";
import { base } from "viem/chains";
import { sdk } from "@/lib/farcaster-sdk";
import { useWallet } from "@/hooks/useWallet";

/**
 * Player Signal Hook
 * Uses special matchId range for player signals
 *
 * Player IDs are converted to match IDs: 9000000000 + hash(playerId)
 *
 * IMPORTANT: These matchIds must exist in the contract!
 * Admin must call addMatches() with these special matchIds first.
 *
 * Example:
 * - arda-guler → matchId: 9000012345
 * - kylian-mbappe → matchId: 9000067890
 *
 * Admin should add these as "virtual matches" in the contract
 * with teamA = player name, teamB = "Player Signal", league = "Players"
 */
export function usePlayerSignal() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hash, setHash] = useState<string | null>(null);

  const { address, isFarcaster } = useWallet();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  /**
   * Convert player ID string to numeric match ID
   * Format: 9000000000 + hash(playerId) % 1000000
   * This ensures player IDs don't conflict with regular match IDs (which are < 1000000)
   */
  const playerIdToMatchId = (playerId: string): bigint => {
    // Simple hash function for player ID
    let hash = 0;
    for (let i = 0; i < playerId.length; i++) {
      const char = playerId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    // Use 9000000000 as base to avoid conflicts with real match IDs
    // Add hash modulo 1000000 to keep it reasonable
    const numericId = 9000000000 + (Math.abs(hash) % 1000000);
    return BigInt(numericId);
  };

  const signal = async (playerId: string) => {
    setIsPending(true);
    setError(null);
    setIsSuccess(false);

    try {
      // Convert player ID to match ID
      const matchId = playerIdToMatchId(playerId);
      // Use teamId 1 for all player signals
      const teamId = 1;

      console.log("🎯 Submitting player signal:", { playerId, matchId: matchId.toString(), teamId });
      console.log("⚠️ NOTE: This matchId must exist in the contract for the transaction to succeed!");

      // Use Farcaster wallet if detected, otherwise use regular wallet
      let clientToUse = walletClient;
      let accountToUse: `0x${string}` | Account | null = address ? (address as `0x${string}`) : null;

      // If useWallet detected Farcaster wallet, use it
      if (isFarcaster && sdk.wallet?.ethProvider) {
        console.log("📱 Using Farcaster wallet for player signal");
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
          if (!walletClient) {
            throw new Error("No wallet available");
          }
        }
      } else if (!walletClient) {
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

      // Send transaction to Base Mainnet
      console.log("📤 Sending player signal transaction to Base Mainnet...");
      console.log("   Match ID:", matchId.toString());
      console.log("   Team ID:", teamId);

      const txHash = await clientToUse.writeContract({
        address: contractAddress,
        abi: PULSEERS_ABI,
        functionName: "signal",
        args: [matchId, teamId],
        account: accountToUse,
        chain: base,
      });

      console.log("✅ Player signal transaction sent successfully!");
      console.log("📤 TX Hash:", txHash);
      console.log("🔍 View on BaseScan: https://basescan.org/tx/" + txHash);
      setHash(txHash);

      // Wait for confirmation
      console.log("⏳ Waiting for confirmation on Base Mainnet...");
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        confirmations: 1,
        timeout: 60_000,
      });

      console.log("✅ Player signal transaction confirmed!");
      console.log("📋 Receipt:", receipt);
      console.log("🔍 BaseScan: https://basescan.org/tx/" + txHash);

      setIsSuccess(true);
      setIsPending(false);

      return txHash;
    } catch (err: any) {
      console.error("❌ Player signal error:", err);

      // Provide helpful error message if matchId doesn't exist
      if (err.message?.includes("Match not found") || err.message?.includes("invalid match")) {
        const matchId = playerIdToMatchId(playerId);
        console.error(`
⚠️ PLAYER SIGNAL SETUP REQUIRED:

This player's matchId (${matchId.toString()}) doesn't exist in the contract yet.

To fix this, the admin must add this player as a "virtual match":
1. Go to /api/admin/add-player-matches
2. OR manually call contract.addMatches() with:
   - matchId: ${matchId.toString()}
   - teamA: "${playerId}"
   - teamB: "Player Signal"
   - league: "Top Players"
   - startTime: far future date
        `);
        throw new Error(`Player signal not set up in contract yet. Admin must add matchId ${matchId.toString()} first.`);
      }

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
