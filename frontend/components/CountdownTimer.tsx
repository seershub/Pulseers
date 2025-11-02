"use client";

import { useEffect, useState } from "react";
import { formatTimeRemaining } from "@/lib/utils";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  startTime: bigint;
}

/**
 * Countdown Timer Component
 * Shows time remaining until match starts
 */
export function CountdownTimer({ startTime }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(
    formatTimeRemaining(startTime)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(startTime));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [startTime]);

  if (timeRemaining === "Started") {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-400">
      <Clock className="w-4 h-4" />
      <span>Starts in {timeRemaining}</span>
    </div>
  );
}
