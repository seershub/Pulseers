import { NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Diagnostic endpoint to check match dates
 * GET /api/admin/diagnose-matches
 */
export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/matches`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch matches');
    }

    const data = await response.json();

    if (!data.success || !data.matches) {
      return NextResponse.json({
        error: "No matches found",
        data
      });
    }

    const now = Math.floor(Date.now() / 1000);
    const matches = data.matches;

    // Analyze matches
    const analysis = matches.map((match: any) => {
      const startTime = Number(match.startTime);
      const diff = startTime - now;
      const status = diff < 0 ? 'PAST' : (diff < 2 * 60 * 60 ? 'LIVE' : 'UPCOMING');

      return {
        matchId: match.matchId,
        teams: `${match.teamA} vs ${match.teamB}`,
        startTime: new Date(startTime * 1000).toISOString(),
        startTimestamp: startTime,
        currentTimestamp: now,
        diffSeconds: diff,
        diffHours: (diff / 3600).toFixed(2),
        diffDays: (diff / 86400).toFixed(2),
        status,
        isActive: match.isActive
      };
    });

    // Group by status
    const upcoming = analysis.filter((m: any) => m.status === 'UPCOMING');
    const live = analysis.filter((m: any) => m.status === 'LIVE');
    const past = analysis.filter((m: any) => m.status === 'PAST');

    return NextResponse.json({
      success: true,
      currentTime: new Date(now * 1000).toISOString(),
      currentTimestamp: now,
      summary: {
        total: matches.length,
        upcoming: upcoming.length,
        live: live.length,
        past: past.length
      },
      matches: {
        upcoming: upcoming.slice(0, 5),
        live: live.slice(0, 5),
        past: past.slice(0, 10)
      },
      recommendation: upcoming.length === 0 && past.length > 0
        ? "❌ All matches are in the PAST! You need to add future matches. Football API might be returning old matches."
        : upcoming.length > 0
        ? `✅ You have ${upcoming.length} upcoming matches`
        : "⚠️ Check match dates carefully"
    });

  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
