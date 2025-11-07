import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http } from "viem";
import { base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { footballAPI, FootballAPI } from "@/lib/football-api";
import { PULSEERS_ABI, PULSEERS_ADDRESS } from "@/lib/contracts";

// CRITICAL: Force Node.js runtime (not Edge)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max

/**
 * Admin API Endpoint to Add Matches On-Chain
 *
 * POST /api/admin/add-matches
 *
 * Body:
 * {
 *   "adminKey": "your-admin-private-key",
 *   "limit": 10  // optional, defaults to 10
 * }
 *
 * This endpoint:
 * 1. Fetches upcoming matches from Football Data API
 * 2. Converts them to contract format
 * 3. Adds them to the smart contract on Base
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminKey, limit = 10 } = body;

    // Validate admin key
    if (!adminKey || typeof adminKey !== "string") {
      return NextResponse.json(
        { error: "Admin key is required" },
        { status: 400 }
      );
    }

    // Create account from private key
    let account;
    try {
      // Remove '0x' prefix if present
      const key = adminKey.startsWith("0x") ? adminKey : `0x${adminKey}`;
      account = privateKeyToAccount(key as `0x${string}`);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid private key format" },
        { status: 400 }
      );
    }

    // Create clients
    const publicClient = createPublicClient({
      chain: base,
      transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
    });

    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
    });

    // Fetch matches from API
    console.log("Fetching matches from Football Data API...");
    const allMatches = await footballAPI.getUpcomingMatches();

    if (allMatches.length === 0) {
      return NextResponse.json(
        {
          error: "No matches found from API",
          hint: "Check if NEXT_PUBLIC_FOOTBALL_API_KEY is set in environment variables. Get free API key from https://www.football-data.org/"
        },
        { status: 404 }
      );
    }

    // CRITICAL: Filter out matches that already exist in contract
    console.log(`Fetched ${allMatches.length} matches from API. Checking for duplicates...`);

    // Get existing match IDs from contract
    let existingMatchIds: bigint[] = [];
    try {
      existingMatchIds = (await publicClient.readContract({
        address: PULSEERS_ADDRESS,
        abi: PULSEERS_ABI,
        functionName: "getAllMatchIds",
      })) as bigint[];

      console.log(`Found ${existingMatchIds.length} existing matches in contract`);
    } catch (error) {
      console.warn("Could not fetch existing matches (contract might be empty):", error);
    }

    // Filter out existing matches and old matches
    const now = Math.floor(Date.now() / 1000);
    const matches = allMatches.filter((match) => {
      const matchId = BigInt(match.id);
      const isNotDuplicate = !existingMatchIds.includes(matchId);
      const isFuture = match.startTime > now;

      if (!isNotDuplicate) {
        console.log(`  ❌ Skipping duplicate match ID ${match.id}: ${match.homeTeam.name} vs ${match.awayTeam.name}`);
      }
      if (!isFuture) {
        console.log(`  ❌ Skipping past match ID ${match.id}: ${match.homeTeam.name} vs ${match.awayTeam.name} (${new Date(match.startTime * 1000).toISOString()})`);
      }

      return isNotDuplicate && isFuture;
    });

    console.log(`After filtering: ${matches.length} new matches to add`);

    if (matches.length === 0) {
      return NextResponse.json(
        {
          error: "No new matches to add",
          message: "All upcoming matches from API are already in the contract or are in the past",
          stats: {
            fetchedFromApi: allMatches.length,
            alreadyInContract: allMatches.filter(m => existingMatchIds.includes(BigInt(m.id))).length,
            pastMatches: allMatches.filter(m => m.startTime <= now).length,
            availableToAdd: 0
          },
          suggestion: "Matches are automatically added. Check back later for new matches, or try increasing the date range in the API configuration."
        },
        { status: 400 }
      );
    }

    // Check if mock data is being used
    const isMockData = matches.some(m => [1001, 1002, 1003].includes(m.id));
    if (isMockData) {
      return NextResponse.json(
        {
          error: "Football API key not configured",
          message: "NEXT_PUBLIC_FOOTBALL_API_KEY is missing or invalid in Vercel Environment Variables",
          instructions: [
            "1. Get a FREE API key from https://www.football-data.org/",
            "2. Go to Vercel Dashboard → Your Project → Settings → Environment Variables",
            "3. Add: NEXT_PUBLIC_FOOTBALL_API_KEY with your API key",
            "4. Redeploy the application",
            "5. Try adding matches again"
          ],
          note: "The free tier allows 10 requests per minute - perfect for this app",
          apiKeyFormat: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
          currentMatches: matches.length,
          mockData: true
        },
        { status: 400 }
      );
    }

    // Limit the number of matches
    const matchesToAdd = matches.slice(0, limit);

    // Convert to contract format - prepare separate arrays
    const matchIds: bigint[] = [];
    const teamAs: string[] = [];
    const teamBs: string[] = [];
    const leagues: string[] = [];
    const logoAs: string[] = [];
    const logoBs: string[] = [];
    const startTimes: bigint[] = [];

    matchesToAdd.forEach((match) => {
      const contractMatch = FootballAPI.toContractFormat(match);
      matchIds.push(contractMatch.matchId);
      teamAs.push(contractMatch.teamA);
      teamBs.push(contractMatch.teamB);
      leagues.push(contractMatch.league);
      logoAs.push(contractMatch.logoA);
      logoBs.push(contractMatch.logoB);
      startTimes.push(contractMatch.startTime);
    });

    console.log(`Adding ${matchIds.length} matches to contract...`);
    console.log("Admin account:", account.address);

    // Prepare transaction (owner check is done by contract's onlyOwner modifier)
    const { request: txRequest } = await publicClient.simulateContract({
      address: PULSEERS_ADDRESS,
      abi: PULSEERS_ABI,
      functionName: "addMatches",
      args: [matchIds, teamAs, teamBs, leagues, logoAs, logoBs, startTimes],
      account,
    });

    // Send transaction
    const hash = await walletClient.writeContract(txRequest);

    console.log("Transaction sent:", hash);

    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return NextResponse.json({
      success: true,
      transactionHash: hash,
      matchesAdded: matchIds.length,
      stats: {
        fetchedFromApi: allMatches.length,
        duplicatesSkipped: allMatches.filter(m => existingMatchIds.includes(BigInt(m.id))).length,
        pastMatchesSkipped: allMatches.filter(m => m.startTime <= now).length,
        newMatchesAdded: matchIds.length
      },
      matches: matchesToAdd.map((m) => ({
        id: m.id,
        homeTeam: m.homeTeam.name,
        awayTeam: m.awayTeam.name,
        league: m.league.name,
        startTime: new Date(m.startTime * 1000).toISOString(),
      })),
      receipt: {
        blockNumber: receipt.blockNumber.toString(),
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status,
      },
    });
  } catch (error: any) {
    console.error("Error adding matches:", error);

    return NextResponse.json(
      {
        error: "Failed to add matches",
        message: error.message,
        details: error.cause?.message || error.details,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check status
export async function GET() {
  const hasApiKey = !!process.env.NEXT_PUBLIC_FOOTBALL_API_KEY;

  return NextResponse.json({
    endpoint: "/api/admin/add-matches",
    method: "POST",
    description: "Add upcoming matches from Football Data API to the smart contract",

    status: {
      footballApiConfigured: hasApiKey,
      contractAddress: "0xDB92bc5D7Eee9397d4486EF1d6fbB3DD68bEb640",
      chain: "Base Mainnet",
    },

    usage: {
      method: "POST",
      body: {
        adminKey: "your-contract-owner-private-key",
        limit: 10,
      },
      example: `curl -X POST https://your-domain.com/api/admin/add-matches \\
  -H "Content-Type: application/json" \\
  -d '{"adminKey": "0x...", "limit": 10}'`,
    },

    requirements: [
      "✓ Contract owner private key",
      hasApiKey ? "✓ Football API key configured" : "✗ Football API key NOT configured",
      "✓ Valid RPC connection to Base Mainnet",
    ],

    setup: hasApiKey ? "All set! Ready to add matches." : {
      missing: "NEXT_PUBLIC_FOOTBALL_API_KEY",
      instructions: [
        "1. Get FREE API key: https://www.football-data.org/",
        "2. Add to Vercel: Settings → Environment Variables",
        "3. Redeploy application",
      ],
    },

    note: "Only contract owner can add matches. Private key must match contract owner address.",
  });
}
