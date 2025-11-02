"use client";

import { useEffect } from "react";
import { Header } from "@/components/Header";
import { MatchList } from "@/components/MatchList";

/**
 * Main Page Component
 * Single page application for Pulseers
 */
export default function HomePage() {
  useEffect(() => {
    // MiniKit initialization
    // When running in MiniKit environment, signal that the frame is ready
    if (typeof window !== "undefined" && (window as any).minikit) {
      (window as any).minikit.setFrameReady();
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col safe-area-top safe-area-bottom">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold gradient-text mb-4">
            Pulseers
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Signal your support for your favorite teams on-chain.
            <br />
            One signal per match. Free to use.
          </p>
        </div>

        {/* Upcoming Matches */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="gradient-text">⏱</span> Upcoming Matches
          </h2>
          <MatchList status="UPCOMING" />
        </section>

        {/* Live Matches */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-red-500 animate-pulse">🔴</span> Live Now
          </h2>
          <MatchList status="LIVE" />
        </section>

        {/* Finished Matches */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-gray-500">✓</span> Finished
          </h2>
          <MatchList status="FINISHED" />
        </section>
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
