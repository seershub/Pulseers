"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { MatchList } from "@/components/MatchList";
import { motion } from "framer-motion";
import { TrendingUp, Zap, CheckCircle, Trophy } from "lucide-react";
import { sdk } from "@/lib/farcaster-sdk";

/**
 * Main Page Component
 * Single page application for Pulseers
 */
export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState<"ALL" | "LIVE" | "UPCOMING" | "FINISHED">("ALL");

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
        {/* Hero Section - Enhanced with Base Blue */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl mb-12 mt-8"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 opacity-95" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

          {/* Floating Orbs Animation */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-10 left-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl"
          />

          {/* Content */}
          <div className="relative z-10 text-center py-16 px-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-6 shadow-xl"
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2.5 h-2.5 bg-white rounded-full shadow-lg"
              />
              <span className="text-sm font-bold text-white tracking-wide">Signal Your Team On-Chain</span>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 drop-shadow-2xl"
            >
              Pulseers
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-lg"
            >
              Support your favorite teams with on-chain signals. One signal per match, powered by Base.
            </motion.p>

            {/* Base Logo Badge */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
            >
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                <span className="text-blue-600 text-xs font-black">B</span>
              </div>
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
              <section>
                <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">Finished</span>
                </h2>
                <MatchList status="FINISHED" />
              </section>
            </>
          ) : (
            <MatchList status={activeFilter} />
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
