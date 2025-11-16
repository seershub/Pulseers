import { ethers, upgrades } from "hardhat";

async function main() {
  console.log("🔄 Upgrading Pulseers contract...");

  const proxyAddress = process.env.PULSEERS_PROXY_ADDRESS;

  if (!proxyAddress) {
    throw new Error("PULSEERS_PROXY_ADDRESS not set in .env file");
  }

  const [deployer] = await ethers.getSigners();
  console.log("Upgrading with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  console.log("Current proxy address:", proxyAddress);

  // Get current implementation
  const currentImplementation = await upgrades.erc1967.getImplementationAddress(
    proxyAddress
  );
  console.log("Current implementation:", currentImplementation);

  // Deploy new implementation
  console.log("\nDeploying new implementation...");
  const PulseersV2 = await ethers.getContractFactory("Pulseers");

  const upgraded = await upgrades.upgradeProxy(proxyAddress, PulseersV2, {
    kind: "uups",
  });

  await upgraded.waitForDeployment();

  const newImplementation = await upgrades.erc1967.getImplementationAddress(
    proxyAddress
  );

  console.log("✅ Upgrade successful!");
  console.log("\n📝 Upgrade Summary:");
  console.log("=".repeat(50));
  console.log("Proxy Address:            ", proxyAddress);
  console.log("Old Implementation:       ", currentImplementation);
  console.log("New Implementation:       ", newImplementation);
  console.log("=".repeat(50));

  console.log("\n🔍 To verify new implementation on BaseScan:");
  console.log(`npx hardhat verify --network ${process.env.HARDHAT_NETWORK || 'baseSepolia'} ${newImplementation}`);

  // Test that upgrade preserved state
  console.log("\n🧪 Testing state preservation...");
  const stats = await upgraded.getStats();
  console.log("Current stats:", {
    totalMatches: stats[0].toString(),
    activeMatches: stats[1].toString(),
    totalSignals: stats[2].toString(),
  });

  console.log("\n✨ Upgrade completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
