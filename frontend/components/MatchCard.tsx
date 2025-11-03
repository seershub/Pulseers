"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { MatchWithStatus } from "@/lib/contracts";
import { useSignal } from "@/hooks/useSignal";
import { useUserSignal } from "@/hooks/useUserSignal";
import { useAccount } from "wagmi";
import { formatMatchDate } from "@/lib/utils";
import { Trophy, CalendarDays, TrendingUp, Users, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AnimatedSignalBar } from "./AnimatedSignalBar";

interface MatchCardProps {
  match: MatchWithStatus;
  index: number;
}

export function MatchCard({ match, index }: MatchCardProps) {
  const { isConnected } = useAccount();
  const { signal, isPending, isSuccess } = useSignal();
  const { hasSignaled, teamChoice, refetch } = useUserSignal(match.matchId);
  const [selectedTeam, setSelectedTeam] = useState<1 | 2 | null>(null);

  const totalSignals = Number(match.signalsTeamA) + Number(match.signalsTeamB);
  const isActive = match.status !== "FINISHED";

  const handleSignal = async (teamId: 1 | 2) => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    if (hasSignaled) {
      alert("You have already signaled for this match");
      return;
    }

    setSelectedTeam(teamId);

    try {
      await signal(match.matchId, teamId);
      setTimeout(() => {
        refetch();
        setSelectedTeam(null);
      }, 3000);
    } catch (error: any) {
      console.error("Signal error:", error);
      alert(error.message || "Failed to submit signal");
      setSelectedTeam(null);
    }
  };

  const matchDate = new Date(Number(match.startTime) * 1000);
  const isLive = match.status === "LIVE";
  const isFinished = match.status === "FINISHED";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="match-card group"
    >
      {/* Header with League and Status */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-700">{match.league}</span>
        </div>

        {isLive && (
          <div className="live-badge">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-600 text-xs font-bold">LIVE</span>
          </div>
        )}

        {isFinished && (
          <div className="badge badge-success">
            <CheckCircle2 className="w-3 h-3" />
            <span>Finished</span>
          </div>
        )}

        {!isLive && !isFinished && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <CalendarDays className="w-3 h-3" />
            <span>{formatMatchDate(match.startTime)}</span>
          </div>
        )}
      </div>

      {/* Teams Display */}
      <div className="relative mb-8">
        <div className="grid grid-cols-3 gap-4 items-center">
          {/* Team A */}
          <div className="flex flex-col items-center gap-3">
            <div className="team-badge">
              <Image
                src={match.logoA || "/placeholder-team.png"}
                alt={match.teamA}
                className="w-12 h-12 object-contain"
                width={48}
                height={48}
                onError={(e: any) => {
                  e.currentTarget.src = "/placeholder-team.png";
                }}
              />
            </div>
            <h3 className="text-center text-sm font-bold text-gray-900 line-clamp-2">
              {match.teamA}
            </h3>
            {hasSignaled && teamChoice === 1 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="badge badge-primary"
              >
                <CheckCircle2 className="w-3 h-3" />
                Your Signal
              </motion.div>
            )}
          </div>

          {/* VS Badge */}
          <div className="flex flex-col items-center gap-2">
            <div className="vs-badge">VS</div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="w-3 h-3" />
              <span>{totalSignals} signals</span>
            </div>
          </div>

          {/* Team B */}
          <div className="flex flex-col items-center gap-3">
            <div className="team-badge">
              <Image
                src={match.logoB || "/placeholder-team.png"}
                alt={match.teamB}
                className="w-12 h-12 object-contain"
                width={48}
                height={48}
                onError={(e: any) => {
                  e.currentTarget.src = "/placeholder-team.png";
                }}
              />
            </div>
            <h3 className="text-center text-sm font-bold text-gray-900 line-clamp-2">
              {match.teamB}
            </h3>
            {hasSignaled && teamChoice === 2 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="badge badge-primary"
              >
                <CheckCircle2 className="w-3 h-3" />
                Your Signal
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Animated Signal Bar - Primary Focus */}
      <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-white rounded-2xl border-2 border-blue-100">
        <div className="flex items-center justify-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-black text-gray-900">Community Signals</h3>
        </div>
        <AnimatedSignalBar
          percentageA={match.percentageA}
          percentageB={match.percentageB}
          teamAColor="#0052FF"
          teamBColor="#1A6AFF"
          isLive={isLive}
        />
        <div className="flex justify-between mt-4 text-xs text-gray-500">
          <span>{match.signalsTeamA.toString()} signals</span>
          <span>{match.signalsTeamB.toString()} signals</span>
        </div>
      </div>

      {/* Signal Buttons - Compact */}
      {isActive && !hasSignaled && isConnected && (
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSignal(1)}
            disabled={isPending}
            className={cn(
              "relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed",
              {
                "animate-pulse": selectedTeam === 1 && isPending,
              }
            )}
          >
            {isPending && selectedTeam === 1 ? (
              <Loader2 className="w-5 h-5 mx-auto animate-spin" />
            ) : (
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Signal</span>
              </div>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSignal(2)}
            disabled={isPending}
            className={cn(
              "relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed",
              {
                "animate-pulse": selectedTeam === 2 && isPending,
              }
            )}
          >
            {isPending && selectedTeam === 2 ? (
              <Loader2 className="w-5 h-5 mx-auto animate-spin" />
            ) : (
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Signal</span>
              </div>
            )}
          </motion.button>
        </div>
      )}

      {/* Already Signaled Message */}
      {hasSignaled && (
        <div className="glass-card p-4 text-center border-2 border-blue-200">
          <div className="flex items-center justify-center gap-2 text-blue-700 font-semibold">
            <CheckCircle2 className="w-5 h-5" />
            <span>You signaled for {teamChoice === 1 ? match.teamA : match.teamB}</span>
          </div>
        </div>
      )}

      {/* Connect Wallet Message */}
      {!isConnected && isActive && (
        <div className="glass-card p-4 text-center border border-blue-200">
          <p className="text-sm text-gray-600">Connect your wallet to signal</p>
        </div>
      )}

      {/* Success Animation */}
      {isSuccess && selectedTeam && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-blue-500/10 backdrop-blur-sm rounded-3xl"
        >
          <div className="glass-card p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            </motion.div>
            <p className="text-lg font-bold text-gray-900">Signal Recorded!</p>
            <p className="text-sm text-gray-600 mt-1">Transaction confirmed on Base</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
