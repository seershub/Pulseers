"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { PlayerCard } from "./PlayerCard";
import { useWallet } from "@/hooks/useWallet";

interface Player {
  id: string;
  name: string;
  position: string;
  team: string;
  image: string;
  signalCount: number;
}

interface PlayerCarouselProps {
  players: Player[];
  onPlayerSignal?: (playerId: string) => Promise<void>;
  userSignaledPlayers?: Set<string>;
}

export function PlayerCarousel({ players, onPlayerSignal, userSignaledPlayers }: PlayerCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isConnected } = useWallet();

  if (players.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
          <Star className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black gradient-text">Signal Best Players</h2>
          <p className="text-sm text-gray-600">Support your favorite football stars</p>
        </div>
      </div>

      {/* Scrollable Carousel */}
      <div className="relative">
        {/* Scroll Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {players.map((player, index) => (
            <PlayerCard
              key={player.id}
              player={player}
              index={index}
              onSignal={onPlayerSignal}
              hasSignaled={userSignaledPlayers?.has(player.id)}
            />
          ))}
        </div>

        {/* Gradient Fade on edges */}
        <div className="absolute left-0 top-0 bottom-4 w-20 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
