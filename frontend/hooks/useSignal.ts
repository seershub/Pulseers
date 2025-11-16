"use client";

import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { PULSEERS_ADDRESS, PULSEERS_ABI } from "@/lib/contracts";
import { useState } from "react";

/**
 * Hook to handle signaling (submitting vote) for a match
 */
export function useSignal() {
  const { address } = useAccount();
  const [isPending, setIsPending] = useState(false);

  const {
    data: hash,
    writeContract,
    error: writeError,
    isPending: isWritePending,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const signal = async (matchId: bigint, teamId: 1 | 2) => {
    if (!address) {
      throw new Error("Wallet not connected");
    }

    setIsPending(true);

    try {
      writeContract({
        address: PULSEERS_ADDRESS,
        abi: PULSEERS_ABI,
        functionName: "signal",
        args: [matchId, teamId],
      });
    } catch (error) {
      console.error("Signal error:", error);
      setIsPending(false);
      throw error;
    }
  };

  // Reset pending state when transaction completes
  if (isSuccess && isPending) {
    setIsPending(false);
  }

  return {
    signal,
    isPending: isPending || isWritePending || isConfirming,
    isSuccess,
    error: writeError,
    hash,
  };
}
