"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wagmi";
import { useState, useEffect, type ReactNode } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

/**
 * Root Providers Component
 * Wraps the app with necessary context providers
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchInterval: 30 * 1000, // 30 seconds
          },
        },
      })
  );

  // Initialize Farcaster SDK and signal ready
  useEffect(() => {
    const initFarcaster = async () => {
      try {
        // Signal that the app is ready to be displayed
        await sdk.actions.ready();
        console.log("✅ Farcaster SDK: App is ready");
      } catch (error) {
        console.error("❌ Farcaster SDK ready() error:", error);
      }
    };

    initFarcaster();
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
