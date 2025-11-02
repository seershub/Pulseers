"use client";

import { useMatchesByStatus } from "@/hooks/useMatches";
import { MatchCard } from "./MatchCard";
import { MatchStatus } from "@/lib/contracts";
import { Loader2 } from "lucide-react";

interface MatchListProps {
  status: MatchStatus;
}

/**
 * Match List Component
 * Displays a list of matches filtered by status
 */
export function MatchList({ status }: MatchListProps) {
  const { matches, isLoading } = useMatchesByStatus(status);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-gray-400">No {status.toLowerCase()} matches</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {matches.map((match, index) => (
        <MatchCard key={match.matchId.toString()} match={match} index={index} />
      ))}
    </div>
  );
}
