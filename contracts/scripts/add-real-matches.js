const hre = require("hardhat");
const { ethers } = hre;
require("dotenv").config();

/**
 * Script to add real matches from Football API to the contract
 * Requires: FOOTBALL_DATA_API_KEY in .env
 */

const FOOTBALL_API_BASE_URL = "https://api.football-data.org/v4";

async function fetchUpcomingMatches() {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  
  if (!apiKey) {
    console.error("⚠️  FOOTBALL_DATA_API_KEY not found in .env");
    console.log("💡 Get your free API key from: https://www.football-data.org/");
    throw new Error("FOOTBALL_DATA_API_KEY is required");
  }

  // Get matches for next 14 days
  const today = new Date();
  const twoWeeks = new Date(today);
  twoWeeks.setDate(twoWeeks.getDate() + 14);

  const dateFrom = today.toISOString().split("T")[0];
  const dateTo = twoWeeks.toISOString().split("T")[0];

  console.log(`📡 Fetching matches from ${dateFrom} to ${dateTo}...`);

  try {
    const response = await fetch(
      `${FOOTBALL_API_BASE_URL}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}&status=SCHEDULED`,
      {
        headers: {
          "X-Auth-Token": apiKey,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(
          "API rate limit exceeded. Free tier allows 10 requests per minute."
        );
      }
      throw new Error(`Football API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.matches || [];
  } catch (error) {
    console.error("❌ Error fetching matches:", error.message);
    throw error;
  }
}

function transformToContractFormat(matches) {
  return matches
    .filter((match) => {
      // Filter only scheduled matches
      return match.status === "SCHEDULED" || match.status === "TIMED";
    })
    .map((match) => {
      const startTime = Math.floor(new Date(match.utcDate).getTime() / 1000);
      const now = Math.floor(Date.now() / 1000);

      // Skip matches that start in less than 1 hour (too soon)
      if (startTime < now + 3600) {
        return null;
      }

      return {
        matchId: match.id,
        teamA: match.homeTeam.name,
        teamB: match.awayTeam.name,
        league: match.competition.name,
        logoA: match.homeTeam.crest || "",
        logoB: match.awayTeam.crest || "",
        startTime: startTime,
      };
    })
    .filter((match) => match !== null);
}

async function main() {
  console.log("⚽ Adding real matches from Football API to Pulseers contract...\n");

  // Get contract address
  const proxyAddress =
    process.env.PULSEERS_PROXY_ADDRESS ||
    "0xDB92bc5D7Eee9397d4486EF1d6fbB3DD68bEb640"; // Default to deployed address

  console.log("📍 Contract Address:", proxyAddress);

  if (!proxyAddress) {
    throw new Error("PULSEERS_PROXY_ADDRESS not set. Set it in .env or update this script.");
  }

  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    throw new Error(
      "No signers found. Make sure PRIVATE_KEY is set in .env file."
    );
  }
  const deployer = signers[0];
  console.log("👤 Adding matches with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Fetch matches from Football API
  let apiMatches;
  try {
    apiMatches = await fetchUpcomingMatches();
    console.log(`✅ Fetched ${apiMatches.length} matches from API\n`);
  } catch (error) {
    console.error("Failed to fetch from Football API:", error.message);
    throw error;
  }

  if (apiMatches.length === 0) {
    console.log("⚠️  No upcoming matches found. Exiting.");
    return;
  }

  // Transform to contract format
  const matches = transformToContractFormat(apiMatches);

  if (matches.length === 0) {
    console.log("⚠️  No valid matches to add (all are too soon or already started).");
    return;
  }

  console.log(`📋 Processing ${matches.length} matches:\n`);
  matches.slice(0, 5).forEach((match, i) => {
    const date = new Date(match.startTime * 1000).toLocaleString();
    console.log(
      `  ${i + 1}. ${match.teamA} vs ${match.teamB} (${match.league}) - ${date}`
    );
  });
  if (matches.length > 5) {
    console.log(`  ... and ${matches.length - 5} more matches\n`);
  }

  // Get contract instance
  const Pulseers = await ethers.getContractFactory("Pulseers");
  const contract = Pulseers.attach(proxyAddress);

  // Check existing matches to avoid duplicates
  console.log("\n🔍 Checking existing matches...");
  let existingMatchIds = [];
  try {
    existingMatchIds = await contract.getAllMatchIds();
    console.log(`   Found ${existingMatchIds.length} existing matches`);
  } catch (error) {
    console.log("   Could not fetch existing matches (contract may be empty)");
  }

  // Filter out duplicates
  const newMatches = matches.filter(
    (match) => !existingMatchIds.includes(BigInt(match.matchId))
  );

  if (newMatches.length === 0) {
    console.log("\n✅ All matches already exist in contract. Nothing to add.");
    return;
  }

  console.log(`\n✨ Adding ${newMatches.length} new matches to contract...\n`);

  // Batch matches (add in groups of 10 to avoid gas limits)
  const BATCH_SIZE = 10;
  for (let i = 0; i < newMatches.length; i += BATCH_SIZE) {
    const batch = newMatches.slice(i, i + BATCH_SIZE);
    console.log(
      `📦 Adding batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} matches)...`
    );

    try {
      const tx = await contract.addMatches(
        batch.map((m) => m.matchId),
        batch.map((m) => m.teamA),
        batch.map((m) => m.teamB),
        batch.map((m) => m.league),
        batch.map((m) => m.logoA),
        batch.map((m) => m.logoB),
        batch.map((m) => m.startTime)
      );

      console.log("   Transaction sent:", tx.hash);
      console.log("   Waiting for confirmation...");

      const receipt = await tx.wait();
      console.log(
        `   ✅ Batch added! Gas used: ${receipt.gasUsed.toString()}\n`
      );
    } catch (error) {
      console.error(`   ❌ Error adding batch:`, error.message);
      throw error;
    }
  }

  // Verify
  console.log("🔍 Verifying deployment...");
  const stats = await contract.getStats();
  console.log("\n📊 Current contract stats:");
  console.log("   Total Matches:", stats[0].toString());
  console.log("   Active Matches:", stats[1].toString());
  console.log("   Total Signals:", stats[2].toString());

  console.log("\n✨ Done! Matches added successfully!");
  console.log(`\n🔗 View on BaseScan: https://basescan.org/address/${proxyAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  });
