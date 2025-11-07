import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

const contractAddress = "0xDB92bc5D7Eee9397d4486EF1d6fbB3DD68bEb640";

const ABI = [
  {
    inputs: [],
    name: "getAllMatchIds",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256[]", name: "_matchIds", type: "uint256[]" }],
    name: "getMatches",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "matchId", type: "uint256" },
          { internalType: "string", name: "teamA", type: "string" },
          { internalType: "string", name: "teamB", type: "string" },
          { internalType: "string", name: "league", type: "string" },
          { internalType: "string", name: "logoA", type: "string" },
          { internalType: "string", name: "logoB", type: "string" },
          { internalType: "uint256", name: "startTime", type: "uint256" },
          { internalType: "uint256", name: "signalsTeamA", type: "uint256" },
          { internalType: "uint256", name: "signalsTeamB", type: "uint256" },
          { internalType: "bool", name: "isActive", type: "bool" },
        ],
        internalType: "struct IPulseers.Match[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const publicClient = createPublicClient({
  chain: base,
  transport: http("https://base.llamarpc.com"),
});

async function testContract() {
  try {
    console.log("🔍 Testing Pulseers Contract:", contractAddress);
    console.log("🌐 Network: Base Mainnet\n");

    // Get all match IDs
    console.log("📊 Fetching all match IDs...");
    const matchIds = await publicClient.readContract({
      address: contractAddress,
      abi: ABI,
      functionName: "getAllMatchIds",
    });

    console.log(`✅ Found ${matchIds.length} matches in contract\n`);

    if (matchIds.length === 0) {
      console.log("⚠️ NO MATCHES FOUND IN CONTRACT!");
      console.log("This means:");
      console.log("1. No matches have been added yet");
      console.log("2. OR the admin hasn't called addMatches()");
      console.log("3. OR we're reading from wrong contract address\n");
      return;
    }

    // Get first 10 matches
    const idsToFetch = matchIds.slice(0, 10);
    console.log(`📋 Fetching details for first ${idsToFetch.length} matches...\n`);

    const matches = await publicClient.readContract({
      address: contractAddress,
      abi: ABI,
      functionName: "getMatches",
      args: [idsToFetch],
    });

    // Display each match
    matches.forEach((match, index) => {
      const startDate = new Date(Number(match.startTime) * 1000);
      const now = new Date();
      const isPast = startDate < now;
      const diffHours = Math.abs(now - startDate) / (1000 * 60 * 60);

      console.log(`\n🎯 Match ${index + 1}:`);
      console.log(`  ID: ${match.matchId.toString()}`);
      console.log(`  ${match.teamA} vs ${match.teamB}`);
      console.log(`  League: ${match.league}`);
      console.log(`  Start: ${startDate.toISOString()}`);
      console.log(`  Status: ${isPast ? "⏱️ PAST" : "⏰ UPCOMING"} (${diffHours.toFixed(1)}h ${isPast ? "ago" : "from now"})`);
      console.log(`  Signals: ${match.signalsTeamA.toString()} - ${match.signalsTeamB.toString()}`);
      console.log(`  Active: ${match.isActive ? "✅" : "❌"}`);
      console.log(`  Logo A: ${match.logoA.substring(0, 50)}...`);
      console.log(`  Logo B: ${match.logoB.substring(0, 50)}...`);
    });

    console.log("\n\n📊 SUMMARY:");
    console.log(`Total matches in contract: ${matchIds.length}`);
    const activeCount = matches.filter(m => m.isActive).length;
    console.log(`Active matches: ${activeCount}`);
    const withSignals = matches.filter(m => Number(m.signalsTeamA) + Number(m.signalsTeamB) > 0).length;
    console.log(`Matches with signals: ${withSignals}`);

    // Check if matches are old
    const oldMatches = matches.filter(m => {
      const startDate = new Date(Number(m.startTime) * 1000);
      const now = new Date();
      const daysPast = (now - startDate) / (1000 * 60 * 60 * 24);
      return daysPast > 7; // older than 7 days
    });

    if (oldMatches.length > 0) {
      console.log(`\n⚠️ WARNING: ${oldMatches.length} matches are older than 7 days!`);
      console.log("These should be deactivated or new matches should be added.");
    }

  } catch (error) {
    console.error("❌ ERROR:", error.message);
    console.error(error);
  }
}

testContract();
