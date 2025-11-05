import { NextResponse } from "next/server";
import { publicClient, getContractAddress, DEPLOYMENT_BLOCK } from "@/lib/viem-config";
import { PULSEERS_ABI } from "@/lib/contracts";

// CRITICAL: Force Node.js runtime (not Edge)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max

/**
 * API Route: Get all matches from contract
 * Pattern from SeersLeague - server-side contract reading
 */
export async function GET() {
  try {
    const contractAddress = getContractAddress();

    console.log("📡 Fetching matches from contract:", contractAddress);

    // Method 1: Try getAllMatchIds + getMatches (batch read)
    try {
      const matchIds = await publicClient.readContract({
        address: contractAddress,
        abi: PULSEERS_ABI,
        functionName: "getAllMatchIds",
      });

      console.log("📊 Found match IDs:", matchIds.length);

      if (!matchIds || matchIds.length === 0) {
        console.log("ℹ️ No matches found in contract");
        return NextResponse.json({
          success: true,
          matches: [],
          count: 0,
          source: "contract",
        });
      }

      // Get all match details
      const matches = await publicClient.readContract({
        address: contractAddress,
        abi: PULSEERS_ABI,
        functionName: "getMatches",
        args: [matchIds],
      });

      console.log("✅ Fetched matches:", matches.length);

      // CRITICAL: Filter out player matches (matchId >= 9000000000)
      // Player matches should ONLY appear in "Signal Top Players" section, NOT in match list
      const PLAYER_MATCH_ID_THRESHOLD = 9000000000n;

      const regularMatches = matches.filter((match: any) => match.matchId < PLAYER_MATCH_ID_THRESHOLD);
      const playerMatches = matches.filter((match: any) => match.matchId >= PLAYER_MATCH_ID_THRESHOLD);

      console.log("🏟️  Regular matches:", regularMatches.length);
      console.log("⭐ Player matches (filtered out):", playerMatches.length);

      // Convert BigInt to string for JSON serialization - ONLY regular matches
      const serializedMatches = regularMatches.map((match: any) => ({
        matchId: match.matchId.toString(),
        teamA: match.teamA,
        teamB: match.teamB,
        league: match.league,
        logoA: match.logoA,
        logoB: match.logoB,
        startTime: match.startTime.toString(),
        signalsTeamA: match.signalsTeamA.toString(),
        signalsTeamB: match.signalsTeamB.toString(),
        isActive: match.isActive,
      }));

      return NextResponse.json({
        success: true,
        matches: serializedMatches,
        count: serializedMatches.length,
        source: "contract",
        contractAddress,
      });
    } catch (contractError: any) {
      console.error("❌ Contract read error:", contractError.message);

      // Method 2: Fallback - Try reading events (like SeersLeague)
      try {
        console.log("🔄 Trying event-based approach...");

        const events = await publicClient.getLogs({
          address: contractAddress,
          event: {
            type: "event",
            name: "MatchesAdded",
            inputs: [
              { type: "uint256[]", name: "matchIds", indexed: false },
              { type: "uint256", name: "timestamp", indexed: false },
            ],
          },
          fromBlock: DEPLOYMENT_BLOCK,
          toBlock: "latest",
        });

        console.log("📝 Found MatchesAdded events:", events.length);

        if (events.length === 0) {
          return NextResponse.json({
            success: true,
            matches: [],
            count: 0,
            source: "events",
            message: "No MatchesAdded events found. Contract may be empty.",
          });
        }

        // Extract match IDs from events
        const allMatchIds: bigint[] = [];
        events.forEach((event: any) => {
          if (event.args?.matchIds) {
            allMatchIds.push(...event.args.matchIds);
          }
        });

        console.log("📋 Total match IDs from events:", allMatchIds.length);

        // Fetch match details
        const matches = await publicClient.readContract({
          address: contractAddress,
          abi: PULSEERS_ABI,
          functionName: "getMatches",
          args: [allMatchIds],
        });

        const serializedMatches = matches.map((match: any) => ({
          matchId: match.matchId.toString(),
          teamA: match.teamA,
          teamB: match.teamB,
          league: match.league,
          logoA: match.logoA,
          logoB: match.logoB,
          startTime: match.startTime.toString(),
          signalsTeamA: match.signalsTeamA.toString(),
          signalsTeamB: match.signalsTeamB.toString(),
          isActive: match.isActive,
        }));

        return NextResponse.json({
          success: true,
          matches: serializedMatches,
          count: serializedMatches.length,
          source: "events",
          contractAddress,
        });
      } catch (eventError: any) {
        console.error("❌ Event fetch error:", eventError.message);
        throw eventError;
      }
    }
  } catch (error: any) {
    console.error("❌ API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch matches",
        message: error.message,
        details: error.cause?.message || error.details,
      },
      { status: 500 }
    );
  }
}

// Enable ISR like SeersLeague
export const revalidate = 60; // Revalidate every 60 seconds
