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
  const { switchChainAsync } = useSwitchChain();

  /**
   * CRITICAL: Use EXACT same matchIds as in the contract!
   * These were added via /api/admin/add-player-matches
   *
   * DO NOT use hash function - must match contract exactly
   */
  const PLAYER_MATCH_IDS: Record<string, bigint> = {
    "arda-guler": 9000795967n,
    "kylian-mbappe": 9000193399n,
    "lamine-yamal": 9000556558n,
    "kenan-yildiz": 9000506025n,
  };

  const playerIdToMatchId = (playerId: string): bigint => {
    const matchId = PLAYER_MATCH_IDS[playerId];

    if (!matchId) {
      console.error(`❌ Unknown player ID: ${playerId}`);
      console.error(`   Available players:`, Object.keys(PLAYER_MATCH_IDS));
      throw new Error(`Unknown player ID: ${playerId}. Available: ${Object.keys(PLAYER_MATCH_IDS).join(", ")}`);
    }

    console.log(`🎯 Player ID "${playerId}" → Match ID ${matchId.toString()}`);
    return matchId;
  };

  const signal = async (playerId: string) => {
    setIsPending(true);
    setError(null);
    setIsSuccess(false);

    try {
      // Convert player ID to match ID using EXACT contract values
      const matchId = playerIdToMatchId(playerId);
      // Use teamId 1 for all player signals
      const teamId = 1;

      console.log("========================================");
      console.log("🎯 PLAYER SIGNAL TRANSACTION");
      console.log("========================================");
      console.log("Player ID:", playerId);
      console.log("Match ID:", matchId.toString());
      console.log("Team ID:", teamId);
      console.log("Contract:", getContractAddress());
      console.log("========================================");

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

      // CRITICAL: Set success immediately after transaction is sent
      // Don't wait for confirmation - it can take 30-60 seconds!
      console.log("✅ Setting success state IMMEDIATELY (not waiting for confirmation)");
      setIsSuccess(true);
      setIsPending(false);

      // Wait for confirmation in background (non-blocking)
      publicClient.waitForTransactionReceipt({
        hash: txHash,
        confirmations: 1,
        timeout: 60_000,
      }).then((receipt) => {
        console.log("✅ Player signal confirmed on-chain!");
        console.log("📋 Receipt:", receipt);
      }).catch((err) => {
        console.warn("⚠️ Confirmation wait failed (transaction likely still succeeded):", err.message);
      });

      return txHash;
    } catch (err: any) {
      console.error("========================================");
      console.error("❌ PLAYER SIGNAL ERROR");
      console.error("========================================");
      console.error("Player ID:", playerId);
      console.error("Error:", err.message);
      console.error("Full error:", err);
      console.error("========================================");

      // Check if it's unknown player ID error (from our validation)
      if (err.message?.includes("Unknown player ID")) {
        setError(err);
        setIsPending(false);
        setIsSuccess(false);
        throw err;
      }

      // Check if matchId doesn't exist in contract
      if (err.message?.includes("Match does not exist") || err.message?.includes("Match not found") || err.message?.includes("execution reverted")) {
        console.error(`
⚠️ CONTRACT SYNC ISSUE:

The matchId was added to the contract but might not be indexed yet.

Solutions:
1. Wait 30 seconds and try again (blockchain indexing)
2. Verify transaction on BaseScan
3. Check if player matches were added successfully

Player: ${playerId}
Expected Match ID: ${PLAYER_MATCH_IDS[playerId]?.toString() || "UNKNOWN"}
        `);
        throw new Error(`Match not found in contract. The blockchain may still be indexing. Wait 30 seconds and try again.`);
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
