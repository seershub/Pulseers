/**
 * Wagmi Configuration
 * Sets up Web3 connections with Base network support
 */

import { http, createConfig } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { coinbaseWallet, injected } from "wagmi/connectors";

// Determine which chain to use
const isMainnet = process.env.NEXT_PUBLIC_CHAIN_ID === "8453";
const activeChain = isMainnet ? base : baseSepolia;

export const config = createConfig({
  chains: [activeChain],
  connectors: [
    coinbaseWallet({
      appName: "Pulseers",
      preference: "all",
    }),
    injected(),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: true,
});

export { activeChain };
