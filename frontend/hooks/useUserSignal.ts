"use client";

import { useReadContract, useAccount } from "wagmi";
import { PULSEERS_ADDRESS, PULSEERS_ABI } from "@/lib/contracts";

/**
 * Hook to check if user has already signaled for a match
 */
export function useUserSignal(matchId: bigint) {
  const { address } = useAccount();

  const { data: hasSignaled, refetch } = useReadContract({
    address: PULSEERS_ADDRESS,
    abi: PULSEERS_ABI,
    functionName: "hasUserSignaled",
    args: address ? [matchId, address] : undefined,
    query: {
      enabled: !!address && !!matchId,
    },
  });

  const { data: teamChoice } = useReadContract({
    address: PULSEERS_ADDRESS,
    abi: PULSEERS_ABI,
    functionName: "getUserTeamChoice",
    args: address ? [matchId, address] : undefined,
    query: {
      enabled: !!address && !!matchId && hasSignaled === true,
    },
  });

  return {
    hasSignaled: hasSignaled === true,
    teamChoice: teamChoice ? Number(teamChoice) : undefined,
    refetch,
  };
}
