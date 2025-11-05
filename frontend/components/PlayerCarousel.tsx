"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
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

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280; // width of card + gap
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  if (players.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Section Header - Enhanced */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center shadow-xl"
          >
            <Star className="w-6 h-6 text-white fill-white" />
          </motion.div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Signal Top Players
            </h2>
            <p className="text-sm text-gray-600 font-medium">One signal per player • Compete on-chain</p>
          </div>
        </div>
      </div>

      {/* Scrollable Carousel - Enhanced */}
      <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
        {/* Scroll Buttons - Desktop Only */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white border-2 border-blue-200 rounded-full items-center justify-center shadow-lg hover:bg-blue-50 hover:border-blue-300 transition-all"
        >
          <ChevronLeft className="w-6 h-6 text-blue-600" />
        </button>

        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white border-2 border-blue-200 rounded-full items-center justify-center shadow-lg hover:bg-blue-50 hover:border-blue-300 transition-all"
        >
          <ChevronRight className="w-6 h-6 text-blue-600" />
        </button>

        {/* Scroll Container */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide pb-6 scroll-smooth snap-x snap-mandatory"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {players.map((player, index) => (
            <div key={player.id} className="snap-center">
              <PlayerCard
                player={player}
                index={index}
                onSignal={onPlayerSignal}
                hasSignaled={userSignaledPlayers?.has(player.id)}
              />
            </div>
          ))}
        </div>

        {/* Gradient Fade on edges */}
        <div className="hidden md:block absolute left-0 top-0 bottom-6 w-20 bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent pointer-events-none" />
        <div className="hidden md:block absolute right-0 top-0 bottom-6 w-20 bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent pointer-events-none" />
      </div>

      {/* Scroll hint for mobile */}
      <div className="md:hidden text-center mt-2">
        <p className="text-xs text-gray-500">← Swipe to see more players →</p>
      </div>
    </motion.div>
  );
}
