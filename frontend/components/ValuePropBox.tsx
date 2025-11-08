"use client";

import { motion } from "framer-motion";
import { TrendingUp, Zap, ExternalLink, Users } from "lucide-react";

/**
 * Value Proposition Box
 * Explains the strategic funnel: Pulseers (free) → SeersLeague (paid)
 * Positioned prominently to drive conversion
 */
export function ValuePropBox() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="relative overflow-hidden rounded-2xl mb-10"
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 opacity-90" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMS41IiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

      {/* Content */}
      <div className="relative z-10 px-6 py-6 md:py-8">
        {/* Icon and Title */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
              Use the Wisdom of the Crowd
            </h2>
            <p className="text-white/90 text-sm md:text-base leading-relaxed">
              Check the community pulse here for <strong>free</strong>. See which teams get the most support,
              then use this data as an <strong>edge</strong> when making real USDC predictions on SeersLeague!
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
          <div className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <Zap className="w-4 h-4 text-yellow-300" />
            <span className="text-white text-sm font-semibold">Free Community Signals</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <TrendingUp className="w-4 h-4 text-green-300" />
            <span className="text-white text-sm font-semibold">Real USDC Rewards on SeersLeague</span>
          </div>
        </div>

        {/* CTA Button */}
        <a
          href="https://league.seershub.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-white/90 transition-all hover:scale-105 hover:shadow-xl shadow-lg"
        >
          <span>Check SeersLeague (Paid League)</span>
          <ExternalLink className="w-4 h-4" />
        </a>

        {/* Subtle Glow */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>
    </motion.div>
  );
}
