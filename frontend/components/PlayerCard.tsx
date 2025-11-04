"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { TrendingUp, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWallet } from "@/hooks/useWallet";

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
  const [isSuccess, setIsSuccess] = useState(false);

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
    setIsSuccess(false);

    try {
      await onSignal(player.id);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
      }, 2000);
    } catch (error: any) {
      console.error("Player signal error:", error);
      alert(error.message || "Failed to signal player");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative flex-shrink-0 w-52 md:w-60"
    >
      <div className={cn(
        "relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl overflow-hidden shadow-xl transition-all duration-300",
        "hover:shadow-2xl hover:scale-105 border-2 border-white/20"
      )}>
        {/* Player Image - Transparent PNG on top */}
        <div className="relative h-56 md:h-64 overflow-hidden pt-4">
          {player.image ? (
            <Image
              src={player.image}
              alt={player.name}
              fill
              className="object-contain object-top transition-transform duration-300 hover:scale-110"
              priority
              onError={(e: any) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white text-5xl font-black">{player.name.charAt(0)}</span>
            </div>
          )}
        </div>

        {/* Player Info Section */}
        <div className="relative px-4 pb-4 pt-2 bg-white/10 backdrop-blur-md">
          {/* Position Badge - Top Left */}
          <div className="absolute -top-3 left-4 px-3 py-1 bg-yellow-400 rounded-full shadow-lg">
            <span className="text-xs font-black text-gray-900">{player.position}</span>
          </div>

          {/* Player Name & Team */}
          <div className="mt-4 mb-3">
            <h3 className="font-black text-white text-base md:text-lg mb-0.5 line-clamp-1">{player.name}</h3>
            <p className="text-xs text-white/80 line-clamp-1">{player.team}</p>
          </div>

          {/* Signal Stats */}
          <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
            <TrendingUp className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-bold text-white">{player.signalCount}</span>
            <span className="text-xs text-white/70">signals</span>
          </div>

          {/* Signal Button */}
          {isConnected && !hasSignaled && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSignal}
              disabled={isPending}
              className={cn(
                "w-full py-3 px-4 rounded-xl font-bold text-sm transition-all",
                "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600",
                "text-gray-900 shadow-lg hover:shadow-xl",
                "disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
                isSuccess && "from-green-400 to-green-500"
              )}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signaling...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Success!</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  <span>Signal Player</span>
                </>
              )}
            </motion.button>
          )}

          {/* Already Signaled */}
          {hasSignaled && (
            <div className="w-full py-3 px-4 rounded-xl bg-green-500/20 backdrop-blur-sm border-2 border-green-400/50">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-sm font-bold text-green-100">Already Signaled</span>
              </div>
            </div>
          )}

          {/* Not Connected */}
          {!isConnected && (
            <div className="w-full py-3 px-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <span className="text-xs text-white/80 block text-center">Connect Wallet to Signal</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
