/**
 * Viem Configuration (Pattern from SeersLeague)
 * Direct Viem client for reliable contract reading
 */

import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

/**
 * Public client for reading contract data
 * Uses Alchemy for production reliability (like SeersLeague)
 */
export const publicClient = createPublicClient({
  chain: base,
  transport: http(
    process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
      ? `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
      : process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org",
    {
      timeout: 180_000, // 180 seconds like SeersLeague
      retryCount: 5,
      retryDelay: 1000,
    }
  ),
});

/**
 * Contract deployment block for efficient event fetching
 * Update this after contract deployment to avoid scanning entire chain
 */
export const DEPLOYMENT_BLOCK = BigInt(
  process.env.NEXT_PUBLIC_DEPLOYMENT_BLOCK || "22547651"
);

/**
 * Helper to get contract address with fallback
 */
export function getContractAddress(): `0x${string}` {
  const address = process.env.NEXT_PUBLIC_PULSEERS_ADDRESS;
  
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    console.error("⚠️ PULSEERS_ADDRESS not set! Using fallback.");
    return "0xDB92bc5D7Eee9397d4486EF1d6fbB3DD68bEb640";
  }
  
  return address as `0x${string}`;
}
