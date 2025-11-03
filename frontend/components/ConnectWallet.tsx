"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Wallet, LogOut } from "lucide-react";

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <button
        onClick={() => disconnect()}
        className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl border border-red-200 transition-all hover:scale-105 active:scale-95"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Disconnect</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => {
        const coinbaseConnector = connectors.find((c) => c.id === "coinbaseWalletSDK");
        if (coinbaseConnector) {
          connect({ connector: coinbaseConnector });
        } else if (connectors[0]) {
          connect({ connector: connectors[0] });
        }
      }}
      className="btn-primary flex items-center gap-2"
    >
      <Wallet className="w-4 h-4" />
      <span>Connect Wallet</span>
    </button>
  );
}
