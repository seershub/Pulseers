"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Floating Guide Button
 * Always visible button to reopen the onboarding guide
 * Positioned in bottom-right corner with subtle pulse animation
 */
export function FloatingGuideButton() {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    // Call the global reopenOnboarding function from OnboardingModal
    if (typeof window !== "undefined" && (window as any).reopenOnboarding) {
      (window as any).reopenOnboarding();
    }
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring" }}
      className="fixed bottom-6 right-6 z-40"
    >
      <motion.button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 p-4 shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/50"
      >
        {/* Pulse Ring Animation */}
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full bg-blue-400"
        />

        {/* Icon */}
        <HelpCircle size={24} className="text-white relative z-10" />

        {/* Tooltip on Hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="absolute right-full mr-3 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-xl border border-gray-800"
            >
              How it works
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}
