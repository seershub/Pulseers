"use client";

import { useState, useEffect } from "react";
import { MatchWithStatus } from "@/lib/contracts";
import { getMatchStatus, calculatePercentages } from "@/lib/utils";

/**
 * Hook to fetch all matches from API route
 * Pattern from SeersLeague - fetch from API instead of direct contract reads
 */
export function useMatches() {
  const [matches, setMatches] = useState<MatchWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = async () => {
    try {
      console.log("🔄 Fetching matches from API...");
      const response = await fetch("/api/matches", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      console.log("📦 API response:", data);

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch matches");
      }

      // Process matches with status and percentages
      const processedMatches: MatchWithStatus[] = data.matches.map((match: any) => {
        const status = getMatchStatus(BigInt(match.startTime));
        const { percentageA, percentageB } = calculatePercentages(
          BigInt(match.signalsTeamA),
          BigInt(match.signalsTeamB)
        );

        return {
          matchId: BigInt(match.matchId),
          teamA: match.teamA,
          teamB: match.teamB,
          league: match.league,
          logoA: match.logoA,
          logoB: match.logoB,
          startTime: BigInt(match.startTime),
          signalsTeamA: BigInt(match.signalsTeamA),
          signalsTeamB: BigInt(match.signalsTeamB),
          isActive: match.isActive,
          status,
          percentageA,
          percentageB,
        };
      });

      console.log("✅ Processed matches:", processedMatches.length);
      setMatches(processedMatches);
      setError(null);
    } catch (err: any) {
      console.error("❌ Error fetching matches:", err);
      setError(err.message);
      setMatches([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();

    // Poll every 30 seconds like SeersLeague
    const interval = setInterval(fetchMatches, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    matches,
    isLoading,
    error,
    refetch: fetchMatches,
  };
}

/**
 * Hook to get matches filtered by status
 */
export function useMatchesByStatus(status: "UPCOMING" | "LIVE" | "FINISHED") {
  const { matches, isLoading } = useMatches();

  const filteredMatches = matches.filter((match) => match.status === status);

  return {
    matches: filteredMatches,
    isLoading,
  };
}
