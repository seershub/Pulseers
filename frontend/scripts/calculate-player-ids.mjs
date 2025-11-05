/**
 * Calculate Player Match IDs
 *
 * This script calculates the matchIds that will be used for player signals.
 * These matchIds must be added to the contract before player signals can work.
 */

const players = [
  { id: "arda-guler", name: "Arda Güler", image: "/6.png" },
  { id: "kylian-mbappe", name: "Kylian Mbappé", image: "/7.png" },
  { id: "lamine-yamal", name: "Lamine Yamal", image: "/8.png" },
  { id: "kenan-yildiz", name: "Kenan Yıldız", image: "/9.png" },
];

function playerIdToMatchId(playerId) {
  // Same hash function as in usePlayerSignal.ts
  let hash = 0;
  for (let i = 0; i < playerId.length; i++) {
    const char = playerId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const numericId = 9000000000 + (Math.abs(hash) % 1000000);
  return BigInt(numericId);
}

console.log("🎯 Player Match IDs for Pulseers Contract\n");
console.log("=" .repeat(70));

players.forEach((player) => {
  const matchId = playerIdToMatchId(player.id);
  console.log(`\n${player.name}`);
  console.log(`  Player ID: ${player.id}`);
  console.log(`  Match ID:  ${matchId.toString()}`);
  console.log(`  Image:     ${player.image}`);
});

console.log("\n" + "=".repeat(70));
console.log("\n📝 Contract Setup Code (for admin):\n");

const matchIds = players.map((p) => playerIdToMatchId(p.id).toString() + "n");
const teamAs = players.map((p) => `"${p.name}"`);
const teamBs = players.map(() => `"Player Signal"`);
const leagues = players.map(() => `"Top Players"`);
const logoAs = players.map((p) => `"${p.image}"`);
const logoBs = players.map(() => `""`);
const startTimes = players.map(() => "2147483647n"); // Far future (year 2038)

console.log(`contract.addMatches(`);
console.log(`  [${matchIds.join(", ")}],`);
console.log(`  [${teamAs.join(", ")}],`);
console.log(`  [${teamBs.join(", ")}],`);
console.log(`  [${leagues.join(", ")}],`);
console.log(`  [${logoAs.join(", ")}],`);
console.log(`  [${logoBs.join(", ")}],`);
console.log(`  [${startTimes.join(", ")}]`);
console.log(`);`);

console.log("\n" + "=".repeat(70));
console.log("\n📋 Summary:");
console.log(`Total players: ${players.length}`);
console.log(`Match ID range: 9000000000 - 9001000000`);
console.log(`These IDs will NOT conflict with real matches (which use IDs < 10000000)`);

console.log("\n✅ Next Steps:");
console.log("1. Copy the contract setup code above");
console.log("2. Call the contract's addMatches() function with these parameters");
console.log("3. Player signals will then work on-chain!");
