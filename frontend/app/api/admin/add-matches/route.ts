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
    const matches = await footballAPI.getUpcomingMatches();

    if (matches.length === 0) {
      return NextResponse.json(
        {
          error: "No matches found from API",
          hint: "Check if NEXT_PUBLIC_FOOTBALL_API_KEY is set in environment variables. Get free API key from https://www.football-data.org/"
        },
        { status: 404 }
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
