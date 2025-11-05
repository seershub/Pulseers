"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedSignalBarProps {
  percentageA: number;
  percentageB: number;
  teamAColor?: string;
  teamBColor?: string;
  isLive?: boolean;
}

export function AnimatedSignalBar({
  percentageA,
  percentageB,
  teamAColor = "#0052FF",
  teamBColor = "#1A6AFF",
  isLive = false,
}: AnimatedSignalBarProps) {
  const [particles, setParticles] = useState<{ id: number; side: "A" | "B" }[]>([]);

  // Generate particles for live effect
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const newParticle = {
        id: Date.now() + Math.random(),
        side: Math.random() > 0.5 ? "A" : ("B" as "A" | "B"),
      };
      setParticles((prev) => [...prev.slice(-10), newParticle]);
    }, 500);

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="relative">
      {/* Main Signal Bar */}
      <div className="relative h-4 rounded-full overflow-hidden bg-gradient-to-r from-blue-100 to-blue-50 border-2 border-blue-200 shadow-inner">
        {/* Team A Fill */}
        <motion.div
          className="absolute left-0 top-0 h-full"
          style={{
            background: `linear-gradient(90deg, ${teamAColor}, ${teamBColor}20)`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentageA}%` }}
          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Shine Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
            animate={{
              x: ["-100%", "200%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Pulse Effect for Live */}
          {isLive && (
            <motion.div
              className="absolute inset-0"
              animate={{
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                background: `linear-gradient(90deg, transparent, ${teamAColor}40, transparent)`,
              }}
            />
          )}
        </motion.div>

        {/* Center Divider */}
        <div className="absolute left-1/2 top-0 h-full w-0.5 bg-white/30 transform -translate-x-1/2" />

        {/* Particles for Live Effect */}
        {isLive &&
          particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute top-1/2 w-2 h-2 rounded-full"
              style={{
                backgroundColor: particle.side === "A" ? teamAColor : teamBColor,
                left: particle.side === "A" ? "25%" : "75%",
              }}
              initial={{
                opacity: 0,
                y: 0,
                scale: 0,
              }}
              animate={{
                opacity: [0, 1, 0],
                y: [-20, -40],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                ease: "easeOut",
              }}
            />
          ))}
      </div>

      {/* Glow Effect */}
      {isLive && (
        <motion.div
          className="absolute inset-0 rounded-full blur-xl opacity-50"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background: `linear-gradient(90deg, ${teamAColor}40, ${teamBColor}40)`,
          }}
        />
      )}

      {/* Percentage Labels */}
      <div className="flex justify-between mt-3">
        <motion.div
          className="percentage-display text-left"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          {percentageA}%
        </motion.div>
        <motion.div
          className="percentage-display text-right"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          {percentageB}%
        </motion.div>
      </div>
    </div>
  );
}
