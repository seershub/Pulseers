import { ethers, upgrades } from "hardhat";

async function main() {
  console.log("🚀 Deploying Pulseers contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy the Pulseers contract as a UUPS proxy
  const Pulseers = await ethers.getContractFactory("Pulseers");

  console.log("Deploying proxy...");
  const proxy = await upgrades.deployProxy(
    Pulseers,
    [deployer.address], // Initialize with deployer as owner
    {
      kind: "uups",
      initializer: "initialize",
    }
  );

  await proxy.waitForDeployment();
  const proxyAddress = await proxy.getAddress();

  console.log("✅ Pulseers proxy deployed to:", proxyAddress);

  // Get implementation address
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(
    proxyAddress
  );
  console.log("📦 Implementation deployed to:", implementationAddress);

  console.log("\n📝 Deployment Summary:");
  console.log("=".repeat(50));
  console.log("Proxy Address:         ", proxyAddress);
  console.log("Implementation Address:", implementationAddress);
  console.log("Owner:                 ", deployer.address);
  console.log("=".repeat(50));

  console.log("\n🔍 To verify on BaseScan:");
  console.log(`npx hardhat verify --network ${process.env.HARDHAT_NETWORK || 'baseSepolia'} ${implementationAddress}`);

  console.log("\n💾 Save these addresses to your .env file:");
  console.log(`PULSEERS_PROXY_ADDRESS=${proxyAddress}`);
  console.log(`PULSEERS_IMPLEMENTATION_ADDRESS=${implementationAddress}`);

  // Test basic functionality
  console.log("\n🧪 Testing basic functionality...");
  const stats = await proxy.getStats();
  console.log("Initial stats:", {
    totalMatches: stats[0].toString(),
    activeMatches: stats[1].toString(),
    totalSignals: stats[2].toString(),
  });

  console.log("\n✨ Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
