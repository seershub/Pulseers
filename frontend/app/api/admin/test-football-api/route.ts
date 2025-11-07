import { NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Test Football API Connection
 * GET /api/admin/test-football-api
 *
 * Tests if Football Data API key is configured and working
 */
export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_FOOTBALL_API_KEY;

  // Check if API key exists
  if (!apiKey) {
    return NextResponse.json({
      status: "❌ FAILED",
      error: "API key not configured",
      configured: false,
      message: "NEXT_PUBLIC_FOOTBALL_API_KEY is not set in environment variables",
      solution: {
        step1: "Get FREE API key from https://www.football-data.org/client/register",
        step2: "Add to Vercel: Settings → Environment Variables → NEXT_PUBLIC_FOOTBALL_API_KEY",
        step3: "Redeploy the application (Vercel won't auto-deploy for env changes)",
        step4: "Come back and test again"
      },
      limits: {
        freeTier: "10 requests per minute",
        leagues: ["Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "Champions League"],
        cost: "FREE forever"
      }
    }, { status: 400 });
  }

  // Test API connection
  try {
    console.log("Testing Football API connection...");

    const response = await fetch(
      "https://api.football-data.org/v4/competitions/PL/matches?limit=1",
      {
        headers: {
          "X-Auth-Token": apiKey,
        },
      }
    );

    const responseText = await response.text();

    if (!response.ok) {
      let errorMessage = "Unknown error";
      let details = responseText;

      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || "API request failed";
      } catch {
        errorMessage = responseText.substring(0, 200);
      }

      return NextResponse.json({
        status: "❌ FAILED",
        error: "API request failed",
        configured: true,
        httpStatus: response.status,
        message: errorMessage,
        details: details.substring(0, 500),
        possibleReasons: [
          response.status === 403 ? "Invalid API key - check if copied correctly" : null,
          response.status === 429 ? "Rate limit exceeded - wait 1 minute and try again" : null,
          response.status === 401 ? "API key not activated - check email and activate account" : null,
          "API key format might be wrong (should be 32 characters)",
          "Environment variable might not be redeployed (redeploy on Vercel)"
        ].filter(Boolean),
        solution: {
          ifInvalidKey: "Verify API key at https://www.football-data.org/client/home",
          ifRateLimit: "Wait 60 seconds - free tier allows 10 requests/minute",
          ifNotActivated: "Check email and click activation link from football-data.org"
        }
      }, { status: response.status });
    }

    // Parse successful response
    const data = JSON.parse(responseText);
    const matchCount = data.matches?.length || 0;

    return NextResponse.json({
      status: "✅ SUCCESS",
      message: "Football API is working correctly!",
      configured: true,
      connection: "Active",
      testResult: {
        endpoint: "https://api.football-data.org/v4/competitions/PL/matches",
        matchesFound: matchCount,
        sampleMatch: data.matches?.[0] ? {
          id: data.matches[0].id,
          homeTeam: data.matches[0].homeTeam.name,
          awayTeam: data.matches[0].awayTeam.name,
          date: data.matches[0].utcDate,
          competition: data.matches[0].competition.name
        } : null
      },
      apiKeyInfo: {
        length: apiKey.length,
        prefix: apiKey.substring(0, 4) + "****",
        format: apiKey.length === 32 ? "✅ Correct (32 chars)" : "❌ Wrong length - should be 32 characters"
      },
      nextSteps: [
        "✅ API key is working!",
        "You can now add matches from admin panel",
        "Go to /admin and click 'Add Matches to Contract'"
      ]
    }, { status: 200 });

  } catch (error: any) {
    console.error("Football API test failed:", error);

    return NextResponse.json({
      status: "❌ FAILED",
      error: "Connection error",
      configured: true,
      message: error.message,
      details: error.stack?.substring(0, 500),
      possibleReasons: [
        "Network connection issue",
        "API endpoint might be down (rare)",
        "Firewall or proxy blocking request",
        "DNS resolution issue"
      ],
      solution: {
        retry: "Try again in a few seconds",
        checkStatus: "Check API status at https://www.football-data.org/",
        contact: "If problem persists, check Vercel deployment logs"
      }
    }, { status: 500 });
  }
}
