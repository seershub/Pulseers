"use client";

import { useReadContract } from "wagmi";
import { PULSEERS_ADDRESS, PULSEERS_ABI } from "@/lib/contracts";

/**
 * Hook to fetch platform statistics
 */
export function useStats() {
  const { data, isLoading, refetch } = useReadContract({
    address: PULSEERS_ADDRESS,
    abi: PULSEERS_ABI,
    functionName: "getStats",
  });

  return {
    stats: data
      ? {
          totalMatches: Number(data[0]),
          activeMatches: Number(data[1]),
          totalSignals: Number(data[2]),
        }
      : undefined,
    isLoading,
    refetch,
  };
}
