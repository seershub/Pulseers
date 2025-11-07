"use client";

import { useState, useEffect } from "react";
import { X, ArrowRight, Zap, Trophy, Star, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Total number of onboarding steps
const TOTAL_STEPS = 4;

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [storageKey] = useState("pulseers_hasSeenOnboarding_v1");

  // Check localStorage on mount - show modal if first time
  useEffect(() => {
    const hasSeen = localStorage.getItem(storageKey);
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, [storageKey]);

  // Close modal and mark as seen
  const handleClose = () => {
    localStorage.setItem(storageKey, "true");
    setIsOpen(false);
  };

  // Reset to step 1 when reopening
  const handleReopen = () => {
    setStep(1);
    setIsOpen(true);
  };

  // Export handleReopen so FloatingGuideButton can use it
  useEffect(() => {
    // Store the function globally so other components can access it
    (window as any).reopenOnboarding = handleReopen;
    return () => {
      delete (window as any).reopenOnboarding;
    };
  }, []);

  if (!isOpen) {
    return null;
  }

  // Define content for each step
  let stepContent;
  switch (step) {
    case 1:
      stepContent = (
        <StepContent
          icon={<Zap size={48} className="text-blue-400" />}
          title="Welcome to Pulseers!"
          text="Support your favorite football teams with on-chain signals. Built on Base Network, powered by Farcaster."
        />
      );
      break;
    case 2:
      stepContent = (
        <StepContent
          icon={<Trophy size={48} className="text-blue-400" />}
          title="Signal for Your Team"
          text="Pick your team for upcoming matches. One signal per match. Show your support before and during the game!"
        />
      );
      break;
    case 3:
      stepContent = (
        <StepContent
          icon={<Star size={48} className="text-yellow-400" />}
          title="Support Top Players"
          text="Signal for the best players in the league. Help highlight rising stars and MVPs with on-chain support."
        />
      );
      break;
    case 4:
      stepContent = (
        <StepContent
          icon={<Rocket size={48} className="text-green-400" />}
          title="Get Started - It's Free!"
          text="Connect your wallet and start signaling. Gas fees covered by Paymaster. Join the Pulseers community now!"
        />
      );
      break;
    default:
      stepContent = null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-md rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-950 to-gray-900 p-6 shadow-2xl"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors z-10"
          >
            <X size={20} />
          </button>

          {/* Step Content with Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center"
            >
              {stepContent}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Footer */}
          <div className="mt-6 flex items-center justify-between">
            {/* Step Indicator */}
            <span className="text-sm text-gray-500">
              {step} / {TOTAL_STEPS}
            </span>

            <div className="flex gap-4">
              {/* Skip Button */}
              <button
                onClick={handleClose}
                className="text-sm text-gray-500 transition-colors hover:text-white"
              >
                Skip
              </button>

              {/* Next or Finish Button */}
              {step < TOTAL_STEPS ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30"
                >
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleClose}
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-blue-500/40"
                >
                  Let&apos;s Go! <Rocket size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Progress Dots */}
          <div className="mt-4 flex justify-center gap-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index + 1 === step
                    ? "w-8 bg-blue-600"
                    : index + 1 < step
                    ? "w-1.5 bg-blue-600/50"
                    : "w-1.5 bg-gray-700"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Helper component for step content
function StepContent({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.1 }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-800/50 border border-gray-700 backdrop-blur-sm"
      >
        {icon}
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 text-2xl font-bold text-white"
      >
        {title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-2 text-base text-gray-400 leading-relaxed"
      >
        {text}
      </motion.p>
    </>
  );
}
