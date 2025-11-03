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

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100 mb-6">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-blue-700">Signal Your Team On-Chain</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black gradient-text mb-3">
            Pulseers
          </h1>
          <p className="text-gray-600 text-base md:text-lg max-w-xl mx-auto">
            Support your favorite teams with on-chain signals. One signal per match, powered by Base.
          </p>
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
