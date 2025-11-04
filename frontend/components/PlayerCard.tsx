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
  const { isConnected, address } = useWallet();
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Both connected AND address must be available
  const canSignal = isConnected && !!address;

  const handleSignal = async () => {
    if (!canSignal) {
      alert("Please wait for wallet to connect...");
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

          {/* Signal Button - Always show when not signaled */}
          {!hasSignaled && (
            <motion.button
              whileHover={canSignal ? { scale: 1.02 } : {}}
              whileTap={canSignal ? { scale: 0.98 } : {}}
              onClick={handleSignal}
              disabled={!canSignal || isPending}
              className={cn(
                "w-full py-2.5 px-4 rounded-xl font-bold text-sm transition-all",
                "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600",
                "text-white shadow-md hover:shadow-lg",
                "disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
                isSuccess && "from-green-500 to-green-600"
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
              ) : !canSignal ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
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
        </div>
      </div>
    </motion.div>
  );
}
