/**
 * Viem Configuration (Pattern from SeersLeague)
 * Direct Viem client for reliable contract reading
 */

import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

/**
 * Get RPC URL with fallback options
 * Priority: Alchemy > Custom RPC > Cloudflare Public > Base Public
 */
function getRpcUrl(): string {
  // Option 1: Alchemy (best, most reliable)
  if (process.env.NEXT_PUBLIC_ALCHEMY_API_KEY) {
    return `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
  }

  // Option 2: Custom RPC URL
  if (process.env.NEXT_PUBLIC_BASE_RPC_URL) {
    return process.env.NEXT_PUBLIC_BASE_RPC_URL;
  }

  // Option 3: Cloudflare public RPC (more reliable than base.org)
  return "https://base.llamarpc.com";
}

/**
 * Public client for reading contract data
 * Uses multiple RPC fallbacks for reliability
 */
export const publicClient = createPublicClient({
  chain: base,
  transport: http(getRpcUrl(), {
    timeout: 180_000, // 180 seconds like SeersLeague
    retryCount: 5,
    retryDelay: 1000,
  }),
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
