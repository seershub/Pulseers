"use client";

import { useReadContract, useAccount } from "wagmi";
import { PULSEERS_ADDRESS, PULSEERS_ABI } from "@/lib/contracts";
import { useState, useEffect } from "react";
import { sdk } from "@/lib/farcaster-sdk";
import { createWalletClient, custom } from "viem";
import { base } from "viem/chains";

/**
 * Hook to check if user has already signaled for a match
 * Works with both regular wallets and Farcaster wallet
 * Follows Farcaster miniapp best practices
 */
export function useUserSignal(matchId: bigint) {
  const { address: wagmiAddress } = useAccount();
  const [farcasterAddress, setFarcasterAddress] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  // Get Farcaster wallet address if available
  // Using same pattern as useSignal.ts for consistency
  useEffect(() => {
    const getFarcasterAddress = async () => {
      try {
        const isInMiniApp = await sdk.isInMiniApp();
        if (isInMiniApp && !wagmiAddress) {
          const context = await sdk.context;
          if (context.user && sdk.wallet?.ethProvider) {
            try {
              // Use viem wallet client (same pattern as useSignal.ts)
              // This is the recommended way per Farcaster miniapp docs
              const walletClient = createWalletClient({
                chain: base,
                transport: custom(sdk.wallet.ethProvider),
              });
              
              const [addr] = await walletClient.getAddresses();
              if (addr) {
                setFarcasterAddress(addr);
              }
            } catch (err) {
              console.warn("Could not get Farcaster wallet address:", err);
            }
          }
        }
      } catch (error) {
        console.error("Error checking Farcaster wallet:", error);
      }
    };
    getFarcasterAddress();
  }, [wagmiAddress]);

  // Use wagmi address if available, otherwise use Farcaster address
  useEffect(() => {
    setUserAddress(wagmiAddress || farcasterAddress || null);
  }, [wagmiAddress, farcasterAddress]);

  const { data: hasSignaled, refetch } = useReadContract({
    address: PULSEERS_ADDRESS,
    abi: PULSEERS_ABI,
    functionName: "hasUserSignaled",
    args: userAddress ? [matchId, userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!userAddress && !!matchId,
    },
  });

  const { data: teamChoice } = useReadContract({
    address: PULSEERS_ADDRESS,
    abi: PULSEERS_ABI,
    functionName: "getUserTeamChoice",
    args: userAddress ? [matchId, userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!userAddress && !!matchId && hasSignaled === true,
    },
  });

  return {
    hasSignaled: hasSignaled === true,
    teamChoice: teamChoice ? Number(teamChoice) : undefined,
    refetch,
  };
}
