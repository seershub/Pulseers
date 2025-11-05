import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http } from "viem";
import { base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { PULSEERS_ABI, PULSEERS_ADDRESS } from "@/lib/contracts";

// CRITICAL: Force Node.js runtime (not Edge)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max

/**
 * Admin API Endpoint to Add Player "Virtual Matches" On-Chain
 *
 * POST /api/admin/add-player-matches
 *
 * Body:
 * {
 *   "adminKey": "your-admin-private-key"
 * }
 *
 * This endpoint adds the 4 player matchIds to the contract so players can be signaled.
 */

// Player IDs and their corresponding match IDs
const PLAYER_MATCHES = [
  {
    id: "arda-guler",
    name: "Arda Güler",
    matchId: 9000795967n,
    image: "/6.png",
  },
  {
    id: "kylian-mbappe",
    name: "Kylian Mbappé",
    matchId: 9000193399n,
    image: "/7.png",
  },
  {
    id: "lamine-yamal",
    name: "Lamine Yamal",
    matchId: 9000556558n,
    image: "/8.png",
  },
  {
    id: "kenan-yildiz",
    name: "Kenan Yıldız",
    matchId: 9000506025n,
    image: "/9.png",
  },
];

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON in request body",
          message: "Please send valid JSON with adminKey field",
          example: { adminKey: "0x..." }
        },
        { status: 400 }
      );
    }

    const { adminKey } = body;

    // Check for admin key from body or environment
    const finalAdminKey = adminKey || process.env.ADMIN_PRIVATE_KEY;

    if (!finalAdminKey) {
      return NextResponse.json(
        {
          success: false,
          error: "adminKey is required",
          message: "Send adminKey in request body or set ADMIN_PRIVATE_KEY env variable"
        },
        { status: 400 }
      );
    }

    console.log("🔐 Creating admin wallet...");

    // Create admin wallet
    const account = privateKeyToAccount(finalAdminKey as `0x${string}`);
    console.log("✅ Admin address:", account.address);

    // Create clients
    const publicClient = createPublicClient({
      chain: base,
      transport: http("https://mainnet.base.org"),
    });

    const walletClient = createWalletClient({
      chain: base,
      transport: http("https://mainnet.base.org"),
      account,
    });

    console.log("📝 Preparing player matches...");

    // Prepare match data for contract
    const matchIds = PLAYER_MATCHES.map(p => p.matchId);
    const teamAs = PLAYER_MATCHES.map(p => p.name);
    const teamBs = PLAYER_MATCHES.map(() => "Player Signal");
    const leagues = PLAYER_MATCHES.map(() => "Top Players");
    const logoAs = PLAYER_MATCHES.map(p => p.image);
    const logoBs = PLAYER_MATCHES.map(() => "");
    // Far future date (year 2038)
    const startTimes = PLAYER_MATCHES.map(() => 2147483647n);

    console.log("📤 Sending transaction to add player matches...");
    console.log("Match IDs:", matchIds.map(id => id.toString()));

    // Send transaction
    const txHash = await walletClient.writeContract({
      address: PULSEERS_ADDRESS as `0x${string}`,
      abi: PULSEERS_ABI,
      functionName: "addMatches",
      args: [
        matchIds,
        teamAs,
        teamBs,
        leagues,
        logoAs,
        logoBs,
        startTimes,
      ],
    });

    console.log("✅ Transaction sent:", txHash);
    console.log("⏳ Waiting for confirmation...");

    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
      confirmations: 1,
    });

    console.log("✅ Transaction confirmed!");
    console.log("🔍 BaseScan: https://basescan.org/tx/" + txHash);

    return NextResponse.json({
      success: true,
      message: "Player matches added successfully!",
      txHash,
      basescan: `https://basescan.org/tx/${txHash}`,
      addedMatches: PLAYER_MATCHES.map(p => ({
        player: p.name,
        matchId: p.matchId.toString(),
      })),
    });
  } catch (error: any) {
    console.error("❌ Error adding player matches:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to add player matches",
        message: error.message,
        details: error.cause?.message || error.details,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check player match IDs
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/admin/add-player-matches",
    method: "POST",
    description: "Add player 'virtual matches' to the smart contract for player signaling",

    playerMatches: PLAYER_MATCHES.map(p => ({
      player: p.name,
      playerId: p.id,
      matchId: p.matchId.toString(),
      image: p.image,
    })),

    usage: {
      method: "POST",
      body: {
        adminKey: "your-contract-owner-private-key",
      },
      example: `curl -X POST https://your-domain.com/api/admin/add-player-matches \\
  -H "Content-Type: application/json" \\
  -d '{"adminKey": "0x..."}'`,
    },

    note: "Run this ONCE to enable player signaling. These are special matchIds (9000000000+) that represent players instead of matches.",
  });
}
