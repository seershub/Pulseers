# Pulseers Smart Contracts

UUPS Upgradeable smart contracts for the Pulseers platform.

## Overview

The Pulseers contract is built using the UUPS (Universal Upgradeable Proxy Standard) pattern with OpenZeppelin's upgradeable contracts.

## Features

- **UUPS Upgradeable**: Owner-controlled contract upgrades
- **Pausable**: Emergency pause functionality
- **Reentrancy Guard**: Protection against reentrancy attacks
- **ERC-7201 Storage**: Namespaced storage pattern to avoid collisions
- **Gas Optimized**: Batch operations and efficient storage

## Contract Structure

```solidity
Pulseers (UUPS Proxy)
├── UUPSUpgradeable
├── OwnableUpgradeable
├── PausableUpgradeable
└── ReentrancyGuardUpgradeable
```

## Deployment

### Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Set up `.env`:
```bash
cp .env.example .env
```

Required variables:
- `PRIVATE_KEY`: Deployer wallet private key
- `BASE_SEPOLIA_RPC_URL`: Base Sepolia RPC endpoint
- `BASE_RPC_URL`: Base Mainnet RPC endpoint
- `BASESCAN_API_KEY`: BaseScan API key for verification

### Deploy to Testnet

```bash
npm run deploy:sepolia
```

### Deploy to Mainnet

```bash
npm run deploy:mainnet
```

### Verify Contract

```bash
npm run verify
```

## Testing

Run the test suite:

```bash
npm run test
```

## Upgrading

To upgrade the contract:

1. Make changes to `Pulseers.sol`
2. Test thoroughly
3. Run upgrade script:

```bash
# For testnet
npm run upgrade:sepolia

# For mainnet
npm run upgrade:mainnet
```

## Admin Operations

### Adding Matches

Use the helper script:

```bash
node scripts/add-matches.ts
```

Or call directly:

```solidity
addMatches(
    [1001, 1002],
    ["Team A1", "Team A2"],
    ["Team B1", "Team B2"],
    ["League 1", "League 2"],
    ["logo1.png", "logo2.png"],
    ["logo1b.png", "logo2b.png"],
    [timestamp1, timestamp2]
)
```

### Deactivating Matches

```solidity
deactivateMatch(matchId)
```

### Emergency Pause

```solidity
pause()    // Pause all signaling
unpause()  // Resume signaling
```

## Gas Estimates

| Operation | Gas Cost (approx) |
|-----------|-------------------|
| Signal | 80,000 - 100,000 |
| Add 10 Matches | 1,000,000+ |
| Deactivate Match | 30,000 - 50,000 |

## Security

- ✅ OpenZeppelin audited contracts
- ✅ Reentrancy protection
- ✅ Access control (Ownable)
- ✅ Pausable for emergencies
- ✅ UUPS upgrade authorization

## Events

```solidity
event MatchesAdded(uint256[] matchIds, uint256 timestamp);
event SignalAdded(uint256 indexed matchId, address indexed user, uint8 teamId, uint256 timestamp);
event MatchDeactivated(uint256 indexed matchId);
```

## License

MIT
