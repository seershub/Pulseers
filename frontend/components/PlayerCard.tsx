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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        "relative flex-shrink-0 w-48 md:w-56 bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100",
        "hover:scale-105 cursor-pointer group"
      )}
    >
      {/* Player Image */}
      <div className="relative h-48 md:h-56 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
        {player.image ? (
          <Image
            src={player.image}
            alt={player.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e: any) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <span className="text-white text-4xl font-black">{player.name.charAt(0)}</span>
          </div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Position Badge */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-blue-600/90 backdrop-blur-sm rounded-lg text-white text-xs font-bold">
          {player.position}
        </div>
      </div>

      {/* Player Info */}
      <div className="p-4 bg-white">
        <h3 className="font-black text-gray-900 text-sm mb-1 line-clamp-1">{player.name}</h3>
        <p className="text-xs text-gray-600 mb-3 line-clamp-1">{player.team}</p>

        {/* Signal Count */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-gray-900">{player.signalCount}</span>
            <span className="text-xs text-gray-500">signals</span>
          </div>
        </div>

        {/* Signal Button */}
        {isConnected && !hasSignaled && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignal}
            disabled={isPending}
            className={cn(
              "w-full py-2 px-3 rounded-xl font-bold text-sm transition-all",
              "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600",
              "text-white shadow-md hover:shadow-lg",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              isSuccess && "bg-green-500"
            )}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 mx-auto animate-spin" />
            ) : isSuccess ? (
              <CheckCircle2 className="w-4 h-4 mx-auto" />
            ) : (
              "Signal"
            )}
          </motion.button>
        )}

        {/* Already Signaled */}
        {hasSignaled && (
          <div className="w-full py-2 px-3 rounded-xl bg-green-50 border-2 border-green-200 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-xs font-bold text-green-700">Signaled</span>
            </div>
          </div>
        )}

        {/* Not Connected */}
        {!isConnected && (
          <div className="w-full py-2 px-3 rounded-xl bg-gray-100 text-center">
            <span className="text-xs text-gray-600">Connect Wallet</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
