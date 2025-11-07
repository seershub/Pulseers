"use client";

import { useWallet } from "@/hooks/useWallet";
import { useUserHistory } from "@/hooks/useUserHistory";
import { useMatches } from "@/hooks/useMatches";
import { Header } from "@/components/Header";
import { useRouter } from "next/navigation";
import { History, TrendingUp, CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function HistoryPage() {
  const { address, isConnected, isChecking } = useWallet();
  const { history, isLoading: historyLoading } = useUserHistory();
  const { matches } = useMatches();
  const router = useRouter();

  // In Farcaster/BaseApp, show page immediately even if address is still loading
  const showLoading = isChecking && !isConnected;

  if (showLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading wallet...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <h1 className="text-4xl md:text-5xl font-black gradient-text mb-3">
                Signal History
              </h1>
              <p className="text-gray-600 text-lg">
                Connect your wallet to view your signal history
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-3xl p-12 text-center shadow-xl border border-blue-100/50"
            >
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
                <History className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-3">Connect Wallet</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Connect your wallet to see your on-chain signal history
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (historyLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your signal history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <h1 className="text-4xl md:text-5xl font-black gradient-text mb-3">
                Signal History
              </h1>
              <p className="text-gray-600 text-lg">
                Track your past signals and match outcomes
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-3xl p-12 text-center shadow-xl border border-blue-100/50 bg-gradient-to-br from-white to-blue-50/20"
            >
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
                <History className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-3">No Signals Yet</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start signaling for matches to see your history here. Your signals will be recorded on-chain!
              </p>
              <button onClick={() => router.push("/")} className="btn-primary inline-flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Browse Matches
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Get match details for each signal
  const enrichedHistory = history.map((signal) => {
    const match = matches.find((m) => m.matchId === signal.matchId);
    return {
      ...signal,
      match,
    };
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black gradient-text mb-3">
              Signal History
            </h1>
            <p className="text-gray-600 text-lg">
              {history.length} signal{history.length !== 1 ? "s" : ""} • All recorded on-chain
            </p>
          </motion.div>

          <div className="space-y-4">
            {enrichedHistory.map((item, index) => {
              const date = new Date(item.timestamp * 1000);
              const teamName = item.match
                ? item.teamId === 1
                  ? item.match.teamA
                  : item.match.teamB
                : `Team ${item.teamId}`;

              return (
                <motion.div
                  key={item.txHash}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card rounded-2xl p-6 border border-blue-100/50 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="font-bold text-gray-900">Signaled for {teamName}</span>
                      </div>

                      {item.match && (
                        <div className="text-sm text-gray-600 mb-2">
                          {item.match.teamA} vs {item.match.teamB}
                          <span className="mx-2">•</span>
                          {item.match.league}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span>{date.toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{date.toLocaleTimeString()}</span>
                        <span>•</span>
                        <span className="font-mono">Match ID: {item.matchId.toString()}</span>
                      </div>
                    </div>

                    <a
                      href={`https://basescan.org/tx/${item.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
                    >
                      <span>View TX</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
