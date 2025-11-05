"use client";

import { motion } from "framer-motion";
import { MatchWithStatus } from "@/lib/contracts";
import { SignalButton } from "./SignalButton";
import { SignalBar } from "./SignalBar";
import { CountdownTimer } from "./CountdownTimer";
import { useSignal } from "@/hooks/useSignal";
import { useUserSignal } from "@/hooks/useUserSignal";
import { useAccount } from "wagmi";
import { formatMatchDate } from "@/lib/utils";
import { Trophy, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchCardProps {
  match: MatchWithStatus;
  index: number;
}

/**
 * Match Card Component
 * Displays match information and signal buttons
 */
export function MatchCard({ match, index }: MatchCardProps) {
  const { isConnected } = useAccount();
  const { signal, isPending, isSuccess } = useSignal();
  const { hasSignaled, teamChoice, refetch } = useUserSignal(match.matchId);

  const totalSignals = Number(match.signalsTeamA) + Number(match.signalsTeamB);
  const isActive = match.status !== "FINISHED";

  const handleSignal = async (teamId: 1 | 2) => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      await signal(match.matchId, teamId);
      // Wait a bit for blockchain confirmation
      setTimeout(() => {
        refetch();
      }, 2000);
    } catch (error) {
      console.error("Signal error:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-300",
        {
          "opacity-60": match.status === "FINISHED",
        }
      )}
    >
      {/* Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Trophy className="w-4 h-4" />
          <span>{match.league}</span>
        </div>

        {match.status === "LIVE" && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500 rounded-full pulse-glow"
          >
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span className="text-red-400 text-xs font-semibold">LIVE</span>
          </motion.div>
        )}

        {match.status === "FINISHED" && (
          <div className="px-3 py-1 bg-gray-700/50 border border-gray-600 rounded-full">
            <span className="text-gray-400 text-xs font-semibold">FINISHED</span>
          </div>
        )}
      </div>

      {/* Teams */}
      <div className="grid grid-cols-3 items-center gap-4 mb-6">
        {/* Team A */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-2 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
            {match.logoA ? (
              <img
                src={match.logoA}
                alt={match.teamA}
                className="w-12 h-12 object-contain"
              />
            ) : (
              <span className="text-2xl">🛡️</span>
            )}
          </div>
          <h3 className="font-bold text-lg">{match.teamA}</h3>
        </div>

        {/* VS */}
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-500">VS</div>
        </div>

        {/* Team B */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-2 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
            {match.logoB ? (
              <img
                src={match.logoB}
                alt={match.teamB}
                className="w-12 h-12 object-contain"
              />
            ) : (
              <span className="text-2xl">🛡️</span>
            )}
          </div>
          <h3 className="font-bold text-lg">{match.teamB}</h3>
        </div>
      </div>

      {/* Match Date */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-4">
        <CalendarDays className="w-4 h-4" />
        <span>{formatMatchDate(match.startTime)}</span>
      </div>

      {/* Countdown (only for upcoming) */}
      {match.status === "UPCOMING" && (
        <div className="flex justify-center mb-4">
          <CountdownTimer startTime={match.startTime} />
        </div>
      )}

      {/* Signal Bar */}
      <div className="mb-6">
        <SignalBar
          percentageA={match.percentageA}
          percentageB={match.percentageB}
          teamA={match.teamA}
          teamB={match.teamB}
          totalSignals={totalSignals}
        />
      </div>

      {/* Signal Buttons */}
      {isActive && match.isActive ? (
        <div className="grid grid-cols-2 gap-4">
          <SignalButton
            teamName={match.teamA}
            teamId={1}
            onClick={() => handleSignal(1)}
            disabled={hasSignaled || !isConnected}
            isSelected={hasSignaled && teamChoice === 1}
            isPending={isPending}
          />
          <SignalButton
            teamName={match.teamB}
            teamId={2}
            onClick={() => handleSignal(2)}
            disabled={hasSignaled || !isConnected}
            isSelected={hasSignaled && teamChoice === 2}
            isPending={isPending}
          />
        </div>
      ) : (
        <div className="text-center text-gray-500 text-sm">
          Signaling closed
        </div>
      )}

      {/* User feedback */}
      {hasSignaled && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 text-center text-sm text-green-400"
        >
          ✓ You signaled for {teamChoice === 1 ? match.teamA : match.teamB}
        </motion.div>
      )}
    </motion.div>
  );
}
