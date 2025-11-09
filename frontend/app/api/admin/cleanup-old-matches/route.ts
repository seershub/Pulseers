import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http } from "viem";
import { base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { PULSEERS_ABI, PULSEERS_ADDRESS } from "@/lib/contracts";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Cleanup Old Matches - Deactivate finished matches
 * POST /api/admin/cleanup-old-matches
 *
 * Body: { adminKey: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminKey } = body;

    if (!adminKey) {
      return NextResponse.json(
        { error: "Admin key required" },
        { status: 400 }
      );
    }

    // Create account
    let account;
    try {
      const key = adminKey.startsWith("0x") ? adminKey : `0x${adminKey}`;
      account = privateKeyToAccount(key as `0x${string}`);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid private key" },
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

    // Get all matches
    const matchIds = (await publicClient.readContract({
      address: PULSEERS_ADDRESS,
      abi: PULSEERS_ABI,
      functionName: "getAllMatchIds",
    })) as bigint[];

    if (matchIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No matches in contract",
        deactivated: 0
      });
    }

    // Get match details
    const matches = (await publicClient.readContract({
      address: PULSEERS_ADDRESS,
      abi: PULSEERS_ABI,
      functionName: "getMatches",
      args: [matchIds],
    })) as any[];

    // Find old matches (finished + 3 hours ago)
    const now = Math.floor(Date.now() / 1000);
    const oldMatches = matches.filter((match: any) => {
      const matchEnd = Number(match.startTime) + (3 * 60 * 60); // 3 hours after start
      return now > matchEnd && match.isActive;
    });

    if (oldMatches.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No old matches to deactivate",
        totalMatches: matches.length,
        activeMatches: matches.filter((m: any) => m.isActive).length,
        deactivated: 0
      });
    }

    console.log(`🧹 Deactivating ${oldMatches.length} old matches...`);

    // Deactivate each old match
    const deactivated = [];
    const errors = [];

    for (const match of oldMatches) {
      try {
        const hash = await walletClient.writeContract({
          address: PULSEERS_ADDRESS,
          abi: PULSEERS_ABI,
          functionName: "deactivateMatch",
          args: [match.matchId],
          account,
        });

        await publicClient.waitForTransactionReceipt({ hash });

        deactivated.push({
          matchId: match.matchId.toString(),
          teams: `${match.teamA} vs ${match.teamB}`,
          txHash: hash
        });

        console.log(`✅ Deactivated match ${match.matchId}`);
      } catch (error: any) {
        errors.push({
          matchId: match.matchId.toString(),
          error: error.message
        });
        console.error(`❌ Failed to deactivate ${match.matchId}:`, error.message);
      }
    }

    return NextResponse.json({
      success: true,
      deactivated: deactivated.length,
      failed: errors.length,
      matches: deactivated,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        totalMatches: matches.length,
        oldMatches: oldMatches.length,
        deactivatedNow: deactivated.length,
        failed: errors.length
      }
    });

  } catch (error: any) {
    console.error("Cleanup error:", error);
    return NextResponse.json({
      error: error.message,
      details: error.cause?.message
    }, { status: 500 });
  }
}

// GET endpoint for info
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/admin/cleanup-old-matches",
    description: "Deactivate finished matches (3+ hours old)",
    method: "POST",
    body: {
      adminKey: "your-admin-private-key"
    },
    note: "Only contract owner can deactivate matches"
  });
}
