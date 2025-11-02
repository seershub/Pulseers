import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { Pulseers } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Pulseers", function () {
  let pulseers: Pulseers;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  const now = Math.floor(Date.now() / 1000);
  const oneDay = 24 * 60 * 60;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const Pulseers = await ethers.getContractFactory("Pulseers");
    pulseers = await upgrades.deployProxy(
      Pulseers,
      [owner.address],
      { kind: "uups", initializer: "initialize" }
    ) as unknown as Pulseers;

    await pulseers.waitForDeployment();
  });

  describe("Initialization", function () {
    it("Should set the correct owner", async function () {
      expect(await pulseers.owner()).to.equal(owner.address);
    });

    it("Should start with zero stats", async function () {
      const stats = await pulseers.getStats();
      expect(stats[0]).to.equal(0); // totalMatches
      expect(stats[1]).to.equal(0); // activeMatches
      expect(stats[2]).to.equal(0); // totalSignals
    });
  });

  describe("Adding Matches", function () {
    it("Should add matches successfully", async function () {
      const matchIds = [1001, 1002];
      const teamAs = ["Team A1", "Team A2"];
      const teamBs = ["Team B1", "Team B2"];
      const leagues = ["League 1", "League 2"];
      const logoAs = ["logo1.png", "logo2.png"];
      const logoBs = ["logo1b.png", "logo2b.png"];
      const startTimes = [now + oneDay, now + oneDay * 2];

      await expect(
        pulseers.addMatches(
          matchIds,
          teamAs,
          teamBs,
          leagues,
          logoAs,
          logoBs,
          startTimes
        )
      )
        .to.emit(pulseers, "MatchesAdded")
        .withArgs(matchIds, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

      const stats = await pulseers.getStats();
      expect(stats[0]).to.equal(2); // totalMatches
      expect(stats[1]).to.equal(2); // activeMatches
    });

    it("Should revert if arrays length mismatch", async function () {
      await expect(
        pulseers.addMatches(
          [1001],
          ["Team A"],
          ["Team B"],
          ["League"],
          ["logo.png"],
          ["logo2.png"],
          [now + oneDay, now + oneDay * 2] // Wrong length
        )
      ).to.be.revertedWith("Array length mismatch");
    });

    it("Should revert if match already exists", async function () {
      const matchData = {
        matchIds: [1001],
        teamAs: ["Team A"],
        teamBs: ["Team B"],
        leagues: ["League"],
        logoAs: ["logo.png"],
        logoBs: ["logo2.png"],
        startTimes: [now + oneDay],
      };

      await pulseers.addMatches(
        matchData.matchIds,
        matchData.teamAs,
        matchData.teamBs,
        matchData.leagues,
        matchData.logoAs,
        matchData.logoBs,
        matchData.startTimes
      );

      await expect(
        pulseers.addMatches(
          matchData.matchIds,
          matchData.teamAs,
          matchData.teamBs,
          matchData.leagues,
          matchData.logoAs,
          matchData.logoBs,
          matchData.startTimes
        )
      ).to.be.revertedWith("Match already exists");
    });

    it("Should revert if not owner", async function () {
      await expect(
        pulseers.connect(user1).addMatches(
          [1001],
          ["Team A"],
          ["Team B"],
          ["League"],
          ["logo.png"],
          ["logo2.png"],
          [now + oneDay]
        )
      ).to.be.revertedWithCustomError(pulseers, "OwnableUnauthorizedAccount");
    });
  });

  describe("Signaling", function () {
    beforeEach(async function () {
      await pulseers.addMatches(
        [1001],
        ["Team A"],
        ["Team B"],
        ["Premier League"],
        ["logoA.png"],
        ["logoB.png"],
        [now + oneDay]
      );
    });

    it("Should allow user to signal for Team A", async function () {
      await expect(pulseers.connect(user1).signal(1001, 1))
        .to.emit(pulseers, "SignalAdded")
        .withArgs(1001, user1.address, 1, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

      expect(await pulseers.hasUserSignaled(1001, user1.address)).to.be.true;

      const match = await pulseers.getMatch(1001);
      expect(match.signalsTeamA).to.equal(1);
      expect(match.signalsTeamB).to.equal(0);
    });

    it("Should allow user to signal for Team B", async function () {
      await pulseers.connect(user1).signal(1001, 2);

      const match = await pulseers.getMatch(1001);
      expect(match.signalsTeamA).to.equal(0);
      expect(match.signalsTeamB).to.equal(1);
    });

    it("Should revert if user already signaled", async function () {
      await pulseers.connect(user1).signal(1001, 1);

      await expect(
        pulseers.connect(user1).signal(1001, 2)
      ).to.be.revertedWith("Already signaled");
    });

    it("Should revert if invalid team ID", async function () {
      await expect(
        pulseers.connect(user1).signal(1001, 3)
      ).to.be.revertedWith("Invalid team ID");
    });

    it("Should revert if match does not exist", async function () {
      await expect(
        pulseers.connect(user1).signal(9999, 1)
      ).to.be.revertedWith("Match does not exist");
    });

    it("Should calculate percentages correctly", async function () {
      await pulseers.connect(user1).signal(1001, 1);
      await pulseers.connect(user2).signal(1001, 2);

      const [percentageA, percentageB] = await pulseers.getSignalPercentages(1001);
      expect(percentageA).to.equal(50);
      expect(percentageB).to.equal(50);
    });
  });

  describe("Deactivating Matches", function () {
    beforeEach(async function () {
      await pulseers.addMatches(
        [1001],
        ["Team A"],
        ["Team B"],
        ["League"],
        ["logoA.png"],
        ["logoB.png"],
        [now + oneDay]
      );
    });

    it("Should deactivate match", async function () {
      await expect(pulseers.deactivateMatch(1001))
        .to.emit(pulseers, "MatchDeactivated")
        .withArgs(1001);

      const match = await pulseers.getMatch(1001);
      expect(match.isActive).to.be.false;
    });

    it("Should prevent signaling on deactivated match", async function () {
      await pulseers.deactivateMatch(1001);

      await expect(
        pulseers.connect(user1).signal(1001, 1)
      ).to.be.revertedWith("Match not active");
    });
  });

  describe("Upgradeability", function () {
    it("Should upgrade successfully", async function () {
      const PulseersV2 = await ethers.getContractFactory("Pulseers");
      const upgraded = await upgrades.upgradeProxy(
        await pulseers.getAddress(),
        PulseersV2,
        { kind: "uups" }
      );

      expect(await upgraded.owner()).to.equal(owner.address);
    });

    it("Should prevent non-owner from upgrading", async function () {
      const PulseersV2 = await ethers.getContractFactory("Pulseers", user1);

      await expect(
        upgrades.upgradeProxy(
          await pulseers.getAddress(),
          PulseersV2,
          { kind: "uups" }
        )
      ).to.be.reverted;
    });
  });

  describe("Pausability", function () {
    beforeEach(async function () {
      await pulseers.addMatches(
        [1001],
        ["Team A"],
        ["Team B"],
        ["League"],
        ["logoA.png"],
        ["logoB.png"],
        [now + oneDay]
      );
    });

    it("Should pause and unpause", async function () {
      await pulseers.pause();

      await expect(
        pulseers.connect(user1).signal(1001, 1)
      ).to.be.revertedWithCustomError(pulseers, "EnforcedPause");

      await pulseers.unpause();

      await expect(pulseers.connect(user1).signal(1001, 1))
        .to.emit(pulseers, "SignalAdded");
    });
  });
});
