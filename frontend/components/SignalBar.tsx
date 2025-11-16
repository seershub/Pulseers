"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SignalBarProps {
  percentageA: number;
  percentageB: number;
  teamA: string;
  teamB: string;
  totalSignals: number;
}

/**
 * Animated Signal Bar Component
 * Shows percentage distribution between two teams
 */
export function SignalBar({
  percentageA,
  percentageB,
  teamA,
  teamB,
  totalSignals,
}: SignalBarProps) {
  return (
    <div className="space-y-3">
      {/* Signal Count */}
      <div className="text-center text-sm text-gray-400">
        {totalSignals} {totalSignals === 1 ? "signal" : "signals"}
      </div>

      {/* Percentages */}
      <div className="flex items-center justify-between text-sm font-semibold">
        <span className="text-blue-400">{percentageA}%</span>
        <span className="text-pink-400">{percentageB}%</span>
      </div>

      {/* Animated Bar */}
      <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
        {/* Team A Bar */}
        <motion.div
          className={cn("absolute inset-y-0 left-0 signal-bar-a")}
          initial={{ width: 0 }}
          animate={{ width: `${percentageA}%` }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
        />

        {/* Team B Bar (from right) */}
        <motion.div
          className={cn("absolute inset-y-0 right-0 signal-bar-b")}
          initial={{ width: 0 }}
          animate={{ width: `${percentageB}%` }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
        />
      </div>

      {/* Team Labels */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="truncate max-w-[120px]">{teamA}</span>
        <span className="truncate max-w-[120px]">{teamB}</span>
      </div>
    </div>
  );
}
