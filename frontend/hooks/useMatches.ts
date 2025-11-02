"use client";

import { useReadContract, useWatchContractEvent } from "wagmi";
import { PULSEERS_ADDRESS, PULSEERS_ABI, Match, MatchWithStatus } from "@/lib/contracts";
import { getMatchStatus, calculatePercentages } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * Hook to fetch all matches from the contract
 */
export function useMatches() {
  const queryClient = useQueryClient();

  // Get all match IDs
  const { data: matchIds, isLoading: loadingIds } = useReadContract({
    address: PULSEERS_ADDRESS,
    abi: PULSEERS_ABI,
    functionName: "getAllMatchIds",
  });

  // Get match details for all IDs
  const { data: matches, isLoading: loadingMatches, refetch } = useReadContract({
    address: PULSEERS_ADDRESS,
    abi: PULSEERS_ABI,
    functionName: "getMatches",
    args: matchIds ? [matchIds] : undefined,
    query: {
      enabled: !!matchIds && matchIds.length > 0,
    },
  });

  // Watch for new matches being added
  useWatchContractEvent({
    address: PULSEERS_ADDRESS,
    abi: PULSEERS_ABI,
    eventName: "MatchesAdded",
    onLogs: () => {
      refetch();
    },
  });

  // Watch for signal events to update percentages
  useWatchContractEvent({
    address: PULSEERS_ADDRESS,
    abi: PULSEERS_ABI,
    eventName: "SignalAdded",
    onLogs: () => {
      refetch();
    },
  });

  // Process matches with status and percentages
  const matchesWithStatus: MatchWithStatus[] =
    matches?.map((match: Match) => {
      const status = getMatchStatus(match.startTime);
      const { percentageA, percentageB } = calculatePercentages(
        match.signalsTeamA,
        match.signalsTeamB
      );

      return {
        ...match,
        status,
        percentageA,
        percentageB,
      };
    }) || [];

  return {
    matches: matchesWithStatus,
    isLoading: loadingIds || loadingMatches,
    refetch,
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
