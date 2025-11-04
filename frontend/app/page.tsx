"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { MatchList } from "@/components/MatchList";
import { PlayerCarousel } from "@/components/PlayerCarousel";
import { motion } from "framer-motion";
import { TrendingUp, Zap, CheckCircle, Trophy } from "lucide-react";
import { sdk } from "@/lib/farcaster-sdk";
import { useWallet } from "@/hooks/useWallet";
import { usePlayerSignal } from "@/hooks/usePlayerSignal";
import { MatchStatus } from "@/lib/contracts";

/**
 * Main Page Component
 * Single page application for Pulseers
 */
export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState<"ALL" | "LIVE" | "UPCOMING" | "FINISHED">("ALL");
  const { isConnected } = useWallet();
  const [userSignaledPlayers, setUserSignaledPlayers] = useState<Set<string>>(new Set());
  const { signal: signalPlayer, isPending: isPlayerSignalPending } = usePlayerSignal();

  useEffect(() => {
    // Initialize Farcaster SDK
    async function init() {
      const isInMiniApp = await sdk.isInMiniApp();
      if (isInMiniApp) {
        console.log("📱 Running as Farcaster Mini App");
        const context = await sdk.context;
        console.log("👤 User:", context.user);
      }
    }
    init();
  }, []);

  // Real Player Cards - Correct Image Mapping
  const bestPlayers = [
    {
      id: "arda-guler",
      name: "Arda Güler",
      position: "CAM",
      team: "Real Madrid",
      image: "/6.png", // 6.png = Arda Güler
      signalCount: 0,
    },
    {
      id: "kylian-mbappe",
      name: "Kylian Mbappé",
      position: "ST",
      team: "Real Madrid",
      image: "/7.png", // 7.png = Mbappé
      signalCount: 0,
    },
    {
      id: "lamine-yamal",
      name: "Lamine Yamal",
      position: "RW",
      team: "FC Barcelona",
      image: "/8.png", // 8.png = Yamal
      signalCount: 0,
    },
    {
      id: "kenan-yildiz",
      name: "Kenan Yıldız",
      position: "LW",
      team: "Juventus",
      image: "/9.png", // 9.png = Kenan Yıldız
      signalCount: 0,
    },
  ];

  const handlePlayerSignal = async (playerId: string) => {
    try {
      const txHash = await signalPlayer(playerId);
      console.log("✅ Player signal successful, txHash:", txHash);
      
      // Update local state after successful on-chain signal
      setUserSignaledPlayers(prev => new Set(prev).add(playerId));
    } catch (error: any) {
      console.error("❌ Player signal error:", error);
      throw error;
    }
  };

  const filters = [
    { id: "ALL" as const, label: "All Matches", icon: Trophy },
    { id: "LIVE" as const, label: "Live", icon: Zap },
    { id: "UPCOMING" as const, label: "Upcoming", icon: TrendingUp },
    { id: "FINISHED" as const, label: "Finished", icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen flex flex-col safe-area-top safe-area-bottom">
      <Header />

      <main className="flex-1 w-full mx-auto px-4 max-w-6xl">
        {/* Hero Section - Modern & Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl mb-8 mt-6"
        >
          {/* Modern Gradient Background with subtle mesh */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600" />
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]" />
          </div>

          {/* Content - Clean & Compact */}
          <div className="relative z-10 px-6 py-8 md:py-10">
            {/* Header with Badge and Base Logo */}
            <div className="flex items-center justify-between mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                <span className="text-xs font-bold text-white tracking-wide uppercase">On-Chain Signaling</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/25 backdrop-blur-sm rounded-full border border-white/40">
                <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                  <span className="text-blue-600 text-[10px] font-black">B</span>
                </div>
                <span className="text-white text-xs font-bold">Base</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
              Pulseers
            </h1>

            {/* Description - Compact */}
            <p className="text-white/90 text-sm md:text-base max-w-lg font-medium leading-relaxed">
              Support your favorite teams with on-chain signals. One signal per match.
            </p>
          </div>

          {/* Subtle glow effect at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/10 to-transparent" />
        </motion.div>

        {/* Filter Tabs - Grid Layout for Mobile */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:flex md:items-center md:justify-center gap-2 mb-8 max-w-md mx-auto"
        >
          {filters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap text-sm ${
                  activeFilter === filter.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : "bg-white text-gray-600 hover:bg-blue-50 border border-gray-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{filter.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Matches Display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {activeFilter === "ALL" ? (
            <>
              {/* Live Matches */}
              <section className="mb-10">
                <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="gradient-text">Live Now</span>
                </h2>
                <MatchList status="LIVE" />
              </section>

              {/* Upcoming Matches */}
              <section className="mb-10">
                <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="gradient-text">Upcoming</span>
                </h2>
                <MatchList status="UPCOMING" />
              </section>

              {/* Finished Matches */}
              <section className="mb-10">
                <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">Finished</span>
                </h2>
                <MatchList status="FINISHED" />
              </section>

              {/* Signal Best Players Section */}
              <section className="mb-10">
                <PlayerCarousel
                  players={bestPlayers}
                  onPlayerSignal={handlePlayerSignal}
                  userSignaledPlayers={userSignaledPlayers}
                />
              </section>
            </>
          ) : (
            <>
              {(activeFilter === "LIVE" || activeFilter === "UPCOMING" || activeFilter === "FINISHED") && (
                <MatchList status={activeFilter} />
              )}
              {/* Show players section even when filtered */}
              {activeFilter === "LIVE" ? (
                <section className="mt-10">
                  <PlayerCarousel
                    players={bestPlayers}
                    onPlayerSignal={handlePlayerSignal}
                    userSignaledPlayers={userSignaledPlayers}
                  />
                </section>
              ) : null}
            </>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm border-t border-white/5">
        <p>Built on Base • Powered by Farcaster</p>
        <p className="mt-2">
          Pulseers © 2025 • Social signaling, not gambling
        </p>
      </footer>
    </div>
  );
}
