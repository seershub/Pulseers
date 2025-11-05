/**
 * Wagmi Configuration
 * Sets up Web3 connections with Base network support and Paymaster
 */

import { http, createConfig } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { coinbaseWallet, injected } from "wagmi/connectors";

// Determine which chain to use - Default to Base Mainnet (8453)
// This app only works on Base Mainnet, not testnet
const isMainnet = process.env.NEXT_PUBLIC_CHAIN_ID !== "84532";
const activeChain = isMainnet ? base : baseSepolia;

/**
 * Get RPC URL with Paymaster support
 * If CDP API key is available, use Paymaster RPC for FREE transactions
 */
function getBaseRpcUrl(): string {
  const cdpApiKey = process.env.NEXT_PUBLIC_CDP_API_KEY;

  // PRIORITY 1: CDP Paymaster RPC (FREE transactions!)
  if (cdpApiKey && cdpApiKey !== 'your_cdp_key_here') {
    console.log("✅ Paymaster RPC active - FREE transactions enabled!");
    return `https://api.developer.coinbase.com/rpc/v1/base/${cdpApiKey}`;
  }

  // PRIORITY 2: Alchemy RPC
  if (process.env.NEXT_PUBLIC_ALCHEMY_API_KEY) {
    return `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
  }

  // PRIORITY 3: Custom RPC
  if (process.env.NEXT_PUBLIC_BASE_RPC_URL) {
    return process.env.NEXT_PUBLIC_BASE_RPC_URL;
  }

  // PRIORITY 4: Public RPC (fallback)
  return "https://base.llamarpc.com";
}

export const config = createConfig({
  chains: [activeChain],
  connectors: [
    coinbaseWallet({
      appName: "Pulseers",
      preference: "smartWalletOnly", // Prefer Smart Wallet for Paymaster support
    }),
    injected(),
  ],
  transports: {
    [base.id]: http(getBaseRpcUrl()),
    [baseSepolia.id]: http("https://sepolia.base.org"),
  },
  ssr: true,
});

export { activeChain };
