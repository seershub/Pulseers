"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

interface SignalButtonProps {
  teamName: string;
  teamId: 1 | 2;
  onClick: () => void;
  disabled?: boolean;
  isSelected?: boolean;
  isPending?: boolean;
}

/**
 * Signal Button Component
 * Animated button for signaling team support
 */
export function SignalButton({
  teamName,
  teamId,
  onClick,
  disabled,
  isSelected,
  isPending,
}: SignalButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled || isPending}
      className={cn(
        "relative px-6 py-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden",
        {
          "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30":
            teamId === 1 && !isSelected,
          "bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 text-white shadow-lg shadow-pink-500/30":
            teamId === 2 && !isSelected,
          "bg-gradient-to-r from-green-500 to-emerald-600 text-white":
            isSelected,
        }
      )}
    >
      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 bg-white/20"
        initial={{ scale: 0, opacity: 0 }}
        whileTap={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.5 }}
      />

      <div className="relative flex items-center justify-center gap-2">
        {isSelected && <CheckCircle className="w-5 h-5" />}
        {isPending ? "Confirming..." : isSelected ? "Signaled!" : `Signal ${teamName}`}
      </div>
    </motion.button>
  );
}
