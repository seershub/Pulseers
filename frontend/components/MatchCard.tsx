"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { MatchWithStatus } from "@/lib/contracts";
import { useSignal } from "@/hooks/useSignal";
import { useUserSignal } from "@/hooks/useUserSignal";
import { useWallet } from "@/hooks/useWallet";
import { formatMatchDate } from "@/lib/utils";
import { Trophy, CalendarDays, TrendingUp, Users, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { AnimatedSignalBar } from "./AnimatedSignalBar";
import { createPortal } from "react-dom";
import { SharePulseButton } from "./SharePulseButton";

interface MatchCardProps {
  match: MatchWithStatus;
  index: number;
  onSignalSuccess?: () => void;
}

export function MatchCard({ match, index, onSignalSuccess }: MatchCardProps) {
  const { isConnected } = useWallet();
  const { signal, isPending, isSuccess } = useSignal();
  const { hasSignaled, teamChoice, refetch } = useUserSignal(match.matchId);
  const [selectedTeam, setSelectedTeam] = useState<1 | 2 | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successTeam, setSuccessTeam] = useState<1 | 2 | null>(null);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted (for portal)
  useEffect(() => {
    setMounted(true);
    console.log("✅ MatchCard mounted");
    return () => {
      console.log("👋 MatchCard unmounting");
    };
  }, []);

  // Debug state changes
  useEffect(() => {
    console.log("🔍 STATE UPDATE - showSuccess:", showSuccess, "successTeam:", successTeam, "isPending:", isPending);
  }, [showSuccess, successTeam, isPending]);

  // Wallet is automatically detected by useWallet hook
  const walletConnected = isConnected;

  const totalSignals = Number(match.signalsTeamA) + Number(match.signalsTeamB);
  const isActive = match.status !== "FINISHED";

  const handleSignal = async (teamId: 1 | 2) => {
    if (!walletConnected) {
      alert("Please connect your wallet first");
      return;
    }

    // CRITICAL: Prevent multiple signals - check if already signaled
    if (hasSignaled) {
      alert("You have already signaled for this match. You can only signal once per match.");
      return;
    }

    // CRITICAL: Prevent signaling if already pending (double-click protection)
    if (isPending) {
      return;
    }

    setSelectedTeam(teamId);

    try {
      console.log("🎯 Starting signal transaction...");
      console.log("📝 Match ID:", match.matchId.toString());
      console.log("🏆 Team ID:", teamId);
      console.log("🔍 Current states - isPending:", isPending, "showSuccess:", showSuccess);

      const txHash = await signal(match.matchId, teamId);
      console.log("✅ Signal transaction successful!");
      console.log("📤 TX Hash:", txHash);

      // CRITICAL: Set success states IMMEDIATELY
      console.log("🎉 Setting success states NOW!");
      setSuccessTeam(teamId);
      setShowSuccess(true);
      console.log("✅ Success states set - showSuccess: true, successTeam:", teamId);

      // Wait for transaction to be indexed on blockchain
      console.log("⏳ Waiting 2 seconds for blockchain indexing...");
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Refetch user signal state to update UI
      console.log("🔄 Refetching user signal state...");
      await refetch();

      // CRITICAL: Refetch all matches to update signal counts
      if (onSignalSuccess) {
        console.log("🔄 Triggering matches refetch...");
        onSignalSuccess();
      }

      // Auto-hide success popup after 3 seconds
      console.log("⏰ Setting timer to hide success popup in 3 seconds");
      setTimeout(() => {
        console.log("👋 Hiding success popup");
        setShowSuccess(false);
        setSuccessTeam(null);
        setSelectedTeam(null);
      }, 3000);
    } catch (error: any) {
      console.error("❌ Signal transaction failed:", error);
      console.error("❌ Error message:", error.message);
      console.error("❌ Error code:", error.code);

      // Reset ALL states on error
      setShowSuccess(false);
      setSuccessTeam(null);
      setSelectedTeam(null);

      // Better error messages based on error type
      if (error.message?.includes("rejected") || error.message?.includes("denied")) {
        alert("❌ Transaction was rejected. Please try again.");
      } else if (error.message?.includes("Match does not exist") || error.message?.includes("Match not found")) {
        alert("⚠️ This match hasn't been added to the contract yet.\n\nFor player signals: Admin needs to run the add-player-matches endpoint first.\n\nPlease contact support.");
      } else if (error.message?.includes("already signaled")) {
        alert("⚠️ You have already signaled for this match.");
      } else if (error.message?.includes("switch")) {
        alert("⚠️ Please switch your wallet to Base Mainnet and try again.");
      } else {
        alert(`❌ Transaction failed: ${error.message || "Unknown error"}\n\nPlease try again.`);
      }
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
      className="match-card group shadow-xl hover:shadow-2xl transition-all duration-300 border border-blue-100/50 min-h-[600px]"
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

      {/* Signal Buttons - ALWAYS VISIBLE FOR ACTIVE MATCHES */}
      {isActive && (
        <div className="space-y-3">
          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={!hasSignaled && walletConnected ? { scale: 1.05 } : {}}
              whileTap={!hasSignaled && walletConnected ? { scale: 0.95 } : {}}
              onClick={() => handleSignal(1)}
              disabled={isPending || hasSignaled || !walletConnected}
              className={cn(
                "relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed h-12 flex items-center justify-center",
                {
                  "animate-pulse": selectedTeam === 1 && isPending,
                }
              )}
            >
              {isPending && selectedTeam === 1 ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Signal</span>
                </div>
              )}
            </motion.button>

            <motion.button
              whileHover={!hasSignaled && walletConnected ? { scale: 1.05 } : {}}
              whileTap={!hasSignaled && walletConnected ? { scale: 0.95 } : {}}
              onClick={() => handleSignal(2)}
              disabled={isPending || hasSignaled || !walletConnected}
              className={cn(
                "relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed h-12 flex items-center justify-center",
                {
                  "animate-pulse": selectedTeam === 2 && isPending,
                }
              )}
            >
              {isPending && selectedTeam === 2 ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Signal</span>
                </div>
              )}
            </motion.button>
          </div>

          {/* Status Messages */}
          {hasSignaled && (
            <div className="glass-card p-3 text-center border-2 border-green-200 bg-green-50">
              <div className="flex items-center justify-center gap-2 text-green-700 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>You signaled for {teamChoice === 1 ? match.teamA : match.teamB}</span>
              </div>
            </div>
          )}

          {!walletConnected && (
            <div className="glass-card p-3 text-center border border-blue-200 bg-blue-50">
              <p className="text-xs text-gray-600">Connect your wallet to signal</p>
            </div>
          )}
        </div>
      )}

      {/* Match Finished - No Buttons */}
      {!isActive && (
        <div className="glass-card p-4 text-center border border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 font-semibold">Match Finished</p>
        </div>
      )}

      {/* Success Animation Popup - Portal to document.body with AnimatePresence */}
      {mounted && createPortal(
        <AnimatePresence mode="wait">
          {showSuccess && successTeam && (
            <motion.div
              key={`success-popup-${match.matchId}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                margin: 0,
                padding: 0,
                width: '100vw',
                height: '100vh'
              }}
              onClick={() => {
                console.log("🖱️ SUCCESS POPUP - Clicked outside - closing");
                setShowSuccess(false);
                setSuccessTeam(null);
                setSelectedTeam(null);
              }}
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-white p-8 max-w-md mx-4 rounded-3xl shadow-2xl border-4 border-green-400"
                onClick={(e) => {
                  console.log("🖱️ SUCCESS POPUP - Clicked inside - preventing close");
                  e.stopPropagation();
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="mb-4 flex justify-center"
                >
                  <CheckCircle2 className="w-24 h-24 text-green-500 drop-shadow-2xl" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-black text-green-600 text-center mb-3"
                >
                  🎉 Signal Successful! 🎉
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-base text-gray-700 text-center mb-2 font-semibold"
                >
                  You signaled for {successTeam === 1 ? match.teamA : match.teamB}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm text-gray-600 text-center"
                >
                  ✅ Confirmed on Base Mainnet
                </motion.p>

                {/* Share Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-center mt-4"
                >
                  <SharePulseButton
                    teamName={successTeam === 1 ? match.teamA : match.teamB}
                    matchId={match.matchId.toString()}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
}
