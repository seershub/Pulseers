"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "./ui/Button";
import { shortenAddress } from "@/lib/utils";
import { useStats } from "@/hooks/useStats";
import { formatNumber } from "@/lib/utils";

/**
 * Header Component
 * Shows wallet connection and platform stats
 */
export function Header() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { stats } = useStats();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/80 border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="text-3xl">⚽</div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Pulseers</h1>
              {stats && (
                <p className="text-xs text-gray-500">
                  {formatNumber(stats.totalSignals)} signals •{" "}
                  {stats.activeMatches} live
                </p>
              )}
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center gap-4">
            {isConnected && address ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-sm text-gray-400">
                  {shortenAddress(address)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => disconnect()}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const coinbaseConnector = connectors.find(
                    (c) => c.id === "coinbaseWalletSDK"
                  );
                  if (coinbaseConnector) {
                    connect({ connector: coinbaseConnector });
                  } else if (connectors[0]) {
                    connect({ connector: connectors[0] });
                  }
                }}
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
