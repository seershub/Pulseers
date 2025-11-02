import { ethers } from "hardhat";

/**
 * Helper script to add matches to the contract
 * Customize the matches array with real data from Football API
 */
async function main() {
  console.log("⚽ Adding matches to Pulseers contract...");

  const proxyAddress = process.env.PULSEERS_PROXY_ADDRESS;

  if (!proxyAddress) {
    throw new Error("PULSEERS_PROXY_ADDRESS not set in .env file");
  }

  const [deployer] = await ethers.getSigners();
  console.log("Adding matches with account:", deployer.address);

  // Get contract instance
  const Pulseers = await ethers.getContractFactory("Pulseers");
  const contract = Pulseers.attach(proxyAddress);

  // Example matches - Replace with real data from Football API
  const now = Math.floor(Date.now() / 1000);
  const oneDay = 24 * 60 * 60;

  const matches = [
    {
      matchId: 1001,
      teamA: "Manchester United",
      teamB: "Liverpool",
      league: "Premier League",
      logoA: "https://example.com/mufc.png",
      logoB: "https://example.com/lfc.png",
      startTime: now + oneDay,
    },
    {
      matchId: 1002,
      teamA: "Real Madrid",
      teamB: "Barcelona",
      league: "La Liga",
      logoA: "https://example.com/rm.png",
      logoB: "https://example.com/fcb.png",
      startTime: now + oneDay * 2,
    },
    {
      matchId: 1003,
      teamA: "Bayern Munich",
      teamB: "Borussia Dortmund",
      league: "Bundesliga",
      logoA: "https://example.com/fcb.png",
      logoB: "https://example.com/bvb.png",
      startTime: now + oneDay * 3,
    },
  ];

  console.log(`\nAdding ${matches.length} matches...`);

  const tx = await contract.addMatches(
    matches.map((m) => m.matchId),
    matches.map((m) => m.teamA),
    matches.map((m) => m.teamB),
    matches.map((m) => m.league),
    matches.map((m) => m.logoA),
    matches.map((m) => m.logoB),
    matches.map((m) => m.startTime)
  );

  console.log("Transaction sent:", tx.hash);
  console.log("Waiting for confirmation...");

  await tx.wait();

  console.log("✅ Matches added successfully!");

  // Verify
  const stats = await contract.getStats();
  console.log("\nCurrent stats:", {
    totalMatches: stats[0].toString(),
    activeMatches: stats[1].toString(),
    totalSignals: stats[2].toString(),
  });

  console.log("\n✨ Done!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
