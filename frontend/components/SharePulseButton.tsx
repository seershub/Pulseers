"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sdk } from "@/lib/farcaster-sdk";

interface SharePulseButtonProps {
  teamName: string;
  matchId?: string;
}

/**
 * Share Pulse Button
 * Viral loop: Share on Farcaster after boosting a team
 * Uses Farcaster MiniApp SDK to create a cast
 */
export function SharePulseButton({ teamName, matchId }: SharePulseButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);

    try {
      // Check if we're in Farcaster MiniApp
      const isInMiniApp = await sdk.isInMiniApp();

      if (!isInMiniApp) {
        console.warn("Not in Farcaster MiniApp - share not available");
        alert("Share feature is only available in Farcaster app");
        setIsSharing(false);
        return;
      }

      // Create cast with team name and embed
      const castText = `I just boosted ${teamName}! See the community pulse on Pulseers. ⚡️`;

      // Use Farcaster SDK to compose cast
      const result = await sdk.actions.composeCast({
        text: castText,
        embeds: ['https://pulseers.seershub.com']
      });

      console.log("✅ Cast shared successfully:", result);

      setShared(true);

      // Reset after 3 seconds
      setTimeout(() => {
        setShared(false);
      }, 3000);

    } catch (error) {
      console.error("❌ Failed to share cast:", error);

      // Fallback: Open Farcaster with pre-filled text
      const fallbackUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(
        `I just boosted ${teamName}! See the community pulse on Pulseers. ⚡️\n\nhttps://pulseers.seershub.com`
      )}`;

      window.open(fallbackUrl, '_blank');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <motion.button
      onClick={handleShare}
      disabled={isSharing || shared}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
        shared
          ? "bg-green-500/20 text-green-400 border border-green-500/30"
          : "bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <AnimatePresence mode="wait">
        {shared ? (
          <motion.div
            key="check"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Shared!</span>
          </motion.div>
        ) : (
          <motion.div
            key="share"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="flex items-center gap-2"
          >
            {isSharing ? (
              <>
                <div className="w-4 h-4 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
                <span>Sharing...</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share my Pulse</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
