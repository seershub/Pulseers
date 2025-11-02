/**
 * Utility Functions
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Match, MatchStatus } from "./contracts";

/**
 * Merge Tailwind classes safely
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get match status based on timestamps
 */
export function getMatchStatus(startTime: bigint): MatchStatus {
  const now = Math.floor(Date.now() / 1000);
  const matchStart = Number(startTime);
  const matchEnd = matchStart + 2 * 60 * 60; // 2 hours

  if (now < matchStart) return "UPCOMING";
  if (now >= matchStart && now < matchEnd) return "LIVE";
  return "FINISHED";
}

/**
 * Calculate signal percentages
 */
export function calculatePercentages(
  signalsA: bigint,
  signalsB: bigint
): { percentageA: number; percentageB: number } {
  const total = Number(signalsA) + Number(signalsB);

  if (total === 0) {
    return { percentageA: 50, percentageB: 50 };
  }

  const percentageA = Math.round((Number(signalsA) / total) * 100);
  const percentageB = 100 - percentageA;

  return { percentageA, percentageB };
}

/**
 * Format time remaining until match starts
 */
export function formatTimeRemaining(startTime: bigint): string {
  const now = Math.floor(Date.now() / 1000);
  const matchStart = Number(startTime);
  const diff = matchStart - now;

  if (diff <= 0) return "Started";

  const days = Math.floor(diff / (24 * 60 * 60));
  const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((diff % (60 * 60)) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Format date for display
 */
export function formatMatchDate(startTime: bigint): string {
  const date = new Date(Number(startTime) * 1000);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Shorten address for display
 */
export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format number with commas
 */
export function formatNumber(num: number | bigint): string {
  return new Intl.NumberFormat("en-US").format(Number(num));
}
