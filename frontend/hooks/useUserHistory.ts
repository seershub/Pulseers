"use client";

import { useState, useEffect } from "react";
import { publicClient, DEPLOYMENT_BLOCK } from "@/lib/viem-config";
import { PULSEERS_ABI, PULSEERS_ADDRESS } from "@/lib/contracts";
import { useWallet } from "./useWallet";

export interface UserSignalHistory {
  matchId: bigint;
  teamId: number;
  txHash: string;
  timestamp: number;
  blockNumber: bigint;
}

/**
 * Hook to fetch user's signal history from blockchain events
 */
export function useUserHistory() {
  const { address } = useWallet();
  const [history, setHistory] = useState<UserSignalHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      if (!address) {
        setHistory([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log("📊 Fetching signal history for:", address);

        // Fetch Signal events for this user
        const events = await publicClient.getLogs({
          address: PULSEERS_ADDRESS as `0x${string}`,
          event: {
            type: "event",
            name: "Signal",
            inputs: [
              { name: "user", type: "address", indexed: true },
              { name: "matchId", type: "uint256", indexed: true },
              { name: "teamId", type: "uint8", indexed: false },
            ],
          },
          args: {
            user: address as `0x${string}`,
          },
          fromBlock: DEPLOYMENT_BLOCK,
          toBlock: "latest",
        });

        console.log(`✅ Found ${events.length} signals`);

        // Process events with block timestamps
        const historyPromises = events.map(async (event) => {
          const block = await publicClient.getBlock({ blockNumber: event.blockNumber! });

          return {
            matchId: event.args.matchId!,
            teamId: Number(event.args.teamId!),
            txHash: event.transactionHash!,
            timestamp: Number(block.timestamp),
            blockNumber: event.blockNumber!,
          };
        });

        const processedHistory = await Promise.all(historyPromises);

        // Sort by timestamp (newest first)
        processedHistory.sort((a, b) => b.timestamp - a.timestamp);

        setHistory(processedHistory);
        setError(null);
      } catch (err: any) {
        console.error("❌ Error fetching history:", err);
        setError(err.message);
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, [address]);

  return {
    history,
    isLoading,
    error,
  };
}
