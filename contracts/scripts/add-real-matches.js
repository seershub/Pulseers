/**
 * Add Real Matches from Football Data API to Contract
 * Run this in Cursor AI
 */

const hre = require("hardhat");

async function main() {
  console.log("⚽ Fetching matches from Football Data API...");

  const FOOTBALL_API_KEY = process.env.FOOTBALL_DATA_API_KEY;
  const CONTRACT_ADDRESS = "0xDB92bc5D7Eee9397d4486EF1d6fbB3DD68bEb640";

  if (!FOOTBALL_API_KEY) {
    throw new Error("FOOTBALL_DATA_API_KEY not set in .env");
  }

  // Fetch upcoming matches from Football Data API
  const today = new Date();
  const twoWeeks = new Date(today);
  twoWeeks.setDate(twoWeeks.getDate() + 14);

  const dateFrom = today.toISOString().split("T")[0];
  const dateTo = twoWeeks.toISOString().split("T")[0];

  const response = await fetch(
    `https://api.football-data.org/v4/matches?dateFrom=${dateFrom}&dateTo=${dateTo}&status=SCHEDULED`,
    {
      headers: {
        "X-Auth-Token": FOOTBALL_API_KEY,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Football API error: ${response.status}`);
  }

  const data = await response.json();
  const matches = data.matches || [];

  console.log(`Found ${matches.length} upcoming matches`);

  // Take first 10 matches
  const selectedMatches = matches.slice(0, 10);

  // Transform to contract format
  const matchIds = [];
  const teamAs = [];
  const teamBs = [];
  const leagues = [];
  const logoAs = [];
  const logoBs = [];
  const startTimes = [];

  for (const match of selectedMatches) {
    matchIds.push(match.id);
    teamAs.push(match.homeTeam.name);
    teamBs.push(match.awayTeam.name);
    leagues.push(match.competition.name);
    logoAs.push(match.homeTeam.crest || "");
    logoBs.push(match.awayTeam.crest || "");
    startTimes.push(Math.floor(new Date(match.utcDate).getTime() / 1000));

    console.log(`  ${match.homeTeam.name} vs ${match.awayTeam.name} (${match.competition.name})`);
  }

  console.log(`\n📝 Adding ${selectedMatches.length} matches to contract...`);

  // Get contract
  const [deployer] = await hre.ethers.getSigners();
  console.log("Using account:", deployer.address);

  const Pulseers = await hre.ethers.getContractFactory("Pulseers");
  const contract = Pulseers.attach(CONTRACT_ADDRESS);

  // Add matches
  const tx = await contract.addMatches(
    matchIds,
    teamAs,
    teamBs,
    leagues,
    logoAs,
    logoBs,
    startTimes
  );

  console.log("Transaction sent:", tx.hash);
  console.log("Waiting for confirmation...");

  await tx.wait();

  console.log("✅ Matches added successfully!");

  // Verify
  const stats = await contract.getStats();
  console.log("\nContract stats:");
  console.log("  Total matches:", stats[0].toString());
  console.log("  Active matches:", stats[1].toString());
  console.log("  Total signals:", stats[2].toString());

  console.log("\n🎉 Done! Matches are now live on the app!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
