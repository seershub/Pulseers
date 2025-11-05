"use client";

import { useReadContract } from "wagmi";
import { PULSEERS_ADDRESS, PULSEERS_ABI } from "@/lib/contracts";
import { useWallet } from "@/hooks/useWallet";

/**
 * Hook to check if user has already signaled for a match
 * Works with both regular wallets and Farcaster wallet
 * Uses unified useWallet hook for consistent wallet detection
 */
export function useUserSignal(matchId: bigint) {
  const { address } = useWallet();

  const { data: hasSignaled, refetch } = useReadContract({
    address: PULSEERS_ADDRESS,
    abi: PULSEERS_ABI,
    functionName: "hasUserSignaled",
    args: address ? [matchId, address as `0x${string}`] : undefined,
    query: {
      enabled: !!address && !!matchId,
    },
  });

  const { data: teamChoice } = useReadContract({
    address: PULSEERS_ADDRESS,
    abi: PULSEERS_ABI,
    functionName: "getUserTeamChoice",
    args: address ? [matchId, address as `0x${string}`] : undefined,
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
