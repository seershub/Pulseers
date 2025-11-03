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

  // Player data - Update image paths to your player card images
  const bestPlayers = [
    {
      id: "player-1",
      name: "Cristiano Ronaldo",
      position: "FW",
      team: "Al Nassr",
      image: "/player-1.png", // Update with your player card image path
      signalCount: 1247,
    },
    {
      id: "player-2",
      name: "Lionel Messi",
      position: "FW",
      team: "Inter Miami",
      image: "/player-2.png", // Update with your player card image path
      signalCount: 1156,
    },
    {
      id: "player-3",
      name: "Kylian Mbappé",
      position: "FW",
      team: "Paris Saint-Germain",
      image: "/player-3.png", // Update with your player card image path
      signalCount: 987,
    },
    {
      id: "player-4",
      name: "Erling Haaland",
      position: "FW",
      team: "Manchester City",
      image: "/player-4.png", // Update with your player card image path
      signalCount: 856,
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

      <main className="flex-1 container mx-auto px-4 max-w-6xl">
        {/* Hero Section - Enhanced with Base Blue and Animations */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl mb-12 mt-8 shadow-2xl"
        >
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 opacity-95" />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 via-transparent to-blue-300/20" />
          
          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjE1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />

          {/* Animated Floating Orbs */}
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.5, 0.2],
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.15, 0.35, 0.15],
              x: [0, -40, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-10 left-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [0.8, 1.1, 0.8],
              opacity: [0.1, 0.3, 0.1],
              x: [0, 20, 0],
              y: [0, -40, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-200 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
          />

          {/* Content - Compact Hero Section */}
          <div className="relative z-10 text-center py-10 md:py-12 px-6">
            {/* Animated Badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/25 backdrop-blur-lg rounded-full border-2 border-white/40 mb-4 shadow-xl"
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-2.5 h-2.5 bg-white rounded-full shadow-lg"
              />
              <span className="text-xs md:text-sm font-bold text-white tracking-wide uppercase">Signal Your Team On-Chain</span>
            </motion.div>

            {/* Main Title with Animation */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
              className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 drop-shadow-2xl"
            >
              <motion.span
                animate={{ 
                  backgroundPosition: ["0%", "100%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white bg-[length:200%_auto]"
              >
                Pulseers
              </motion.span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-white/90 text-base md:text-lg max-w-xl mx-auto font-medium leading-relaxed drop-shadow-lg mb-4"
            >
              Support your favorite teams with on-chain signals. One signal per match, powered by Base.
            </motion.p>

            {/* Base Logo Badge */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-lg rounded-full border-2 border-white/30 shadow-lg hover:bg-white/25 transition-all cursor-default"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md"
              >
                <span className="text-blue-600 text-xs font-black">B</span>
              </motion.div>
              <span className="text-white text-sm font-semibold">Built on Base</span>
            </motion.div>
          </div>
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
