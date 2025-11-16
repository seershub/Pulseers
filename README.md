# ⚽ Pulseers

**Decentralized Social Signaling Platform for Football Matches**

Pulseers is a Web3 application built on Base Network that allows users to signal their support for football teams on-chain. It's designed as a Farcaster Mini App and also works as a standalone web application.

![Pulseers Banner](./docs/banner.png)

## 🎯 Features

- **Free to Use** - Only minimal gas fees (~$0.02-0.05)
- **On-Chain Signals** - All signals are stored on Base blockchain
- **One Signal Per Match** - Users can signal once before/during matches
- **Real-Time Updates** - Live percentage updates via Wagmi
- **Beautiful UI** - Dark futuristic design with glassmorphism
- **Smooth Animations** - Powered by Framer Motion
- **Cross-Platform** - Works in Base App, Farcaster clients, and browsers

## 🏗️ Tech Stack

### Smart Contracts
- Solidity ^0.8.22
- Hardhat 2.22.0
- OpenZeppelin Contracts Upgradeable 5.x (UUPS Proxy)
- Base Mainnet & Base Sepolia

### Frontend
- Next.js 15.1.0 (App Router)
- React 19
- TypeScript 5.7
- Tailwind CSS 4.0
- Framer Motion 11

### Web3 Integration
- Wagmi 2.13+
- Viem 2.21+
- Coinbase OnchainKit 0.38+
- Coinbase MiniKit 0.1+

## 📁 Project Structure

```
pulseers/
├── contracts/          # Smart contracts (Hardhat)
│   ├── contracts/
│   │   ├── Pulseers.sol
│   │   └── interfaces/
│   ├── scripts/
│   ├── test/
│   └── hardhat.config.ts
│
└── frontend/           # Next.js application
    ├── app/
    ├── components/
    ├── hooks/
    ├── lib/
    └── public/
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- MetaMask or Coinbase Wallet
- Base Sepolia ETH for testing

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/seershub/Pulseers.git
cd Pulseers
```

2. **Install contract dependencies**
```bash
cd contracts
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

### Smart Contract Deployment

1. **Set up environment variables**
```bash
cd contracts
cp .env.example .env
# Edit .env with your private key and API keys
```

2. **Deploy to Base Sepolia testnet**
```bash
npm run deploy:sepolia
```

3. **Verify contract on BaseScan**
```bash
npm run verify
```

4. **Save the deployed proxy address** - You'll need it for the frontend

### Frontend Setup

1. **Set up environment variables**
```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local with your contract address and API keys
```

Required variables:
- `NEXT_PUBLIC_PULSEERS_ADDRESS` - Your deployed contract address
- `NEXT_PUBLIC_CHAIN_ID` - 84532 for Base Sepolia, 8453 for Base Mainnet
- `NEXT_PUBLIC_CDP_API_KEY` - Coinbase Developer Platform API key

2. **Run development server**
```bash
npm run dev
```

3. **Open browser**
```
http://localhost:3000
```

## 🔐 Smart Contract

### Main Functions

**Admin (Owner Only)**
- `addMatches()` - Add matches in batch
- `deactivateMatch()` - Deactivate a match
- `pause()/unpause()` - Emergency pause

**User Functions**
- `signal(matchId, teamId)` - Signal support for a team

**View Functions**
- `getAllMatchIds()` - Get all match IDs
- `getMatches(matchIds[])` - Get match data
- `hasUserSignaled(matchId, user)` - Check if user signaled
- `getSignalPercentages(matchId)` - Get signal distribution
- `getStats()` - Platform statistics

### Contract Address

- **Base Sepolia**: `TBD`
- **Base Mainnet**: `TBD`

## 🎨 Design System

### Colors
- Primary: `#0052FF` (Base Blue)
- Secondary: `#6B4FFF` (Purple)
- Accent: `#FF0080` (Pink)
- Background: Dark gradient

### Components
- Glassmorphism cards
- Gradient text
- Animated signal bars
- Ripple button effects
- Pulse animations for live matches

## 📱 Farcaster Mini App

To run as a Farcaster Mini App:

1. Deploy the frontend to production
2. Generate the manifest:
```bash
npx onchainkit manifest
```
3. Update `public/.well-known/farcaster.json`
4. Test in Warpcast or Base App

## 🧪 Testing

### Smart Contract Tests
```bash
cd contracts
npm run test
```

### Frontend Type Check
```bash
cd frontend
npm run type-check
```

## 📚 Documentation

- [Smart Contract Documentation](./contracts/README.md)
- [Frontend Documentation](./frontend/README.md)
- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🔮 Football API Integration

Currently, the football API is using placeholder data. To integrate a real API:

1. Choose a provider (football-data.org, API-Football, TheSportsDB)
2. Update `frontend/lib/football-api.ts`
3. Add API key to `.env.local`
4. Implement the API methods

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on [Base](https://base.org)
- Powered by [Farcaster](https://farcaster.xyz)
- UI inspired by modern Web3 design patterns
- Thanks to the Coinbase team for MiniKit

## 📞 Contact

- Website: [pulseers.seershub.com](https://pulseers.seershub.com)
- Twitter: [@pulseers](https://twitter.com/pulseers)
- Discord: [Join our community](https://discord.gg/pulseers)

---

**Note:** This is a social signaling platform, not a gambling application. Users signal their support, and there are no financial predictions or rewards involved.
