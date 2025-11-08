"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { TrendingUp, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWallet } from "@/hooks/useWallet";
import { createPortal } from "react-dom";
import { SharePulseButton } from "./SharePulseButton";

interface Player {
  id: string;
  name: string;
  position: string;
  team: string;
  image: string;
  signalCount: number;
}

interface PlayerCardProps {
  player: Player;
  index: number;
  onSignal?: (playerId: string) => Promise<void>;
  hasSignaled?: boolean;
}

export function PlayerCard({ player, index, onSignal, hasSignaled }: PlayerCardProps) {
  const { isConnected } = useWallet();
  const [isPending, setIsPending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log("✅ PlayerCard mounted:", player.name);
  }, [player.name]);

  useEffect(() => {
    console.log("🔍 PLAYER STATE - showSuccess:", showSuccess, "isPending:", isPending, "player:", player.name);
  }, [showSuccess, isPending, player.name]);

  const handleSignal = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    if (hasSignaled) {
      alert("You have already signaled for this player");
      return;
    }

    if (isPending || !onSignal) return;

    setIsPending(true);
    setShowSuccess(false);

    try {
      console.log("🎯 Signaling player:", player.id);
      console.log("🔍 Player name:", player.name);

      await onSignal(player.id);

      console.log("✅ Player signal successful!");
      console.log("🎉 Setting success state NOW!");

      // CRITICAL: Show success popup IMMEDIATELY
      setShowSuccess(true);
      console.log("✅ Success state set - showSuccess: true");

      // Auto-hide after 3 seconds
      setTimeout(() => {
        console.log("👋 Hiding player success popup");
        setShowSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error("❌ Player signal failed:", error);

      // Better error messages
      if (error.message?.includes("rejected") || error.message?.includes("denied")) {
        alert("❌ Transaction was rejected. Please try again.");
      } else if (error.message?.includes("Match does not exist") || error.message?.includes("Match not found") || error.message?.includes("not set up")) {
        alert("⚠️ Player signals are not set up yet.\n\nAdmin needs to run: POST /api/admin/add-player-matches\n\nPlease contact support.");
      } else if (error.message?.includes("already signaled")) {
        alert("⚠️ You have already signaled for this player.");
      } else if (error.message?.includes("switch")) {
        alert("⚠️ Please switch your wallet to Base Mainnet and try again.");
      } else {
        alert(`❌ Failed to signal: ${error.message || "Unknown error"}\n\nPlease try again.`);
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="relative flex-shrink-0 w-48 md:w-52"
    >
      <div className={cn(
        "relative bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300",
        "hover:shadow-2xl hover:scale-105 border-2 border-blue-100"
      )}>
        {/* Player Image - Full Size Transparent PNG */}
        <div className="relative h-64 md:h-72 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
          {player.image ? (
            <Image
              src={player.image}
              alt={player.name}
              fill
              className="object-cover object-top transition-transform duration-300 hover:scale-110"
              priority
              onError={(e: any) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
              <span className="text-white text-5xl font-black">{player.name.charAt(0)}</span>
            </div>
          )}

          {/* Position Badge - Top Right */}
          <div className="absolute top-3 right-3 px-3 py-1 bg-blue-600 rounded-full shadow-lg">
            <span className="text-xs font-black text-white">{player.position}</span>
          </div>
        </div>

        {/* Player Info Section - White Background */}
        <div className="p-4 bg-white">
          {/* Player Name & Team */}
          <h3 className="font-black text-gray-900 text-base mb-1 line-clamp-1">{player.name}</h3>
          <p className="text-xs text-gray-600 mb-3 line-clamp-1">{player.team}</p>

          {/* Signal Stats */}
          <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-blue-50 rounded-lg">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-gray-900">{player.signalCount}</span>
            <span className="text-xs text-gray-600">signals</span>
          </div>

          {/* Signal Button */}
          {isConnected && !hasSignaled && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSignal}
              disabled={isPending}
              className={cn(
                "w-full py-2.5 px-4 rounded-xl font-bold text-sm transition-all",
                "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600",
                "text-white shadow-md hover:shadow-lg",
                "disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
                showSuccess && "from-green-500 to-green-600"
              )}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signaling...</span>
                </>
              ) : showSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Success!</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  <span>Signal</span>
                </>
              )}
            </motion.button>
          )}

          {/* Already Signaled */}
          {hasSignaled && (
            <div className="w-full py-2.5 px-4 rounded-xl bg-green-50 border-2 border-green-200">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-xs font-bold text-green-700">Signaled</span>
              </div>
            </div>
          )}

          {/* Not Connected */}
          {!isConnected && (
            <div className="w-full py-2.5 px-4 rounded-xl bg-gray-100">
              <span className="text-xs text-gray-600 block text-center">Connect Wallet</span>
            </div>
          )}
        </div>
      </div>

      {/* Success Animation Popup - Portal to document.body */}
      {mounted && createPortal(
        <AnimatePresence mode="wait">
          {showSuccess && (
            <motion.div
              key={`player-success-popup-${player.id}`}
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
                console.log("🖱️ PLAYER POPUP - Clicked outside - closing");
                setShowSuccess(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-white p-8 max-w-md mx-4 rounded-3xl shadow-2xl border-4 border-green-400"
                onClick={(e) => {
                  console.log("🖱️ PLAYER POPUP - Clicked inside - preventing close");
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
                  You signaled for {player.name}
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
                    teamName={player.name}
                    matchId={player.id}
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
