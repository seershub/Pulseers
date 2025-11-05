"use client";

import { useState, useEffect } from "react";
import { publicClient, getContractAddress } from "@/lib/viem-config";
import { PULSEERS_ABI } from "@/lib/contracts";

/**
 * Player Match IDs - MUST match hooks/usePlayerSignal.ts
 */
const PLAYER_MATCHES = [
  { id: "arda-guler", name: "Arda Güler", matchId: 9000795967n, position: "CAM", team: "Real Madrid", image: "/6.png" },
  { id: "kylian-mbappe", name: "Kylian Mbappé", matchId: 9000193399n, position: "ST", team: "Real Madrid", image: "/7.png" },
  { id: "lamine-yamal", name: "Lamine Yamal", matchId: 9000556558n, position: "RW", team: "FC Barcelona", image: "/8.png" },
  { id: "kenan-yildiz", name: "Kenan Yıldız", matchId: 9000506025n, position: "LW", team: "Juventus", image: "/9.png" },
];

export function usePlayerMatches() {
  const [players, setPlayers] = useState(PLAYER_MATCHES.map(p => ({ ...p, signalCount: 0 })));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPlayerSignalCounts = async () => {
    try {
      console.log("🔍 Fetching player signal counts...");

      const contractAddress = getContractAddress();
      const matchIds = PLAYER_MATCHES.map(p => p.matchId);

      // Fetch matches from contract
      const matches = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: PULSEERS_ABI,
        functionName: "getMatches",
        args: [matchIds],
      });

      console.log("✅ Player matches fetched:", matches.length);

      // Update players with signal counts
      const updatedPlayers = PLAYER_MATCHES.map((player, index) => {
        const match = matches[index];
        const signalCount = Number(match.signalsTeamA) + Number(match.signalsTeamB);

        console.log(`  ${player.name}: ${signalCount} signals`);

        return {
          ...player,
          signalCount,
        };
      });

      setPlayers(updatedPlayers);
      setIsLoading(false);
    } catch (err: any) {
      console.error("❌ Error fetching player signal counts:", err);
      setError(err);
      setIsLoading(false);

      // Fallback to hardcoded values
      setPlayers(PLAYER_MATCHES.map(p => ({ ...p, signalCount: 0 })));
    }
  };

  useEffect(() => {
    fetchPlayerSignalCounts();
  }, []);

  // Refetch function for after signal success
  const refetch = () => {
    console.log("🔄 Refetching player signal counts...");
    fetchPlayerSignalCounts();
  };

  return {
    players,
    isLoading,
    error,
    refetch,
  };
}
