# Pulseers Frontend

Next.js 15 application for the Pulseers platform with MiniKit integration.

## Features

- ⚡ Next.js 15 with App Router
- 🎨 Tailwind CSS 4.0 with custom theme
- 🎭 Framer Motion animations
- 🔗 Wagmi + Viem for Web3 interactions
- 📱 MiniKit for Farcaster integration
- 🎯 TypeScript with strict mode
- 🔄 Real-time updates via contract events

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm

### Installation

```bash
npm install
```

### Environment Setup

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Required variables:

```env
# Contract
NEXT_PUBLIC_PULSEERS_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=84532  # Base Sepolia

# Coinbase Developer Platform
NEXT_PUBLIC_CDP_API_KEY=your_key

# Optional
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_id
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

Build for production:

```bash
npm run build
```

Start production server:

```bash
npm start
```

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page (ONLY PAGE)
│   ├── providers.tsx       # Context providers
│   └── globals.css         # Global styles
│
├── components/
│   ├── Header.tsx          # Header with wallet
│   ├── MatchCard.tsx       # Match display
│   ├── MatchList.tsx       # Match list wrapper
│   ├── SignalButton.tsx    # Signal button
│   ├── SignalBar.tsx       # Animated bar
│   ├── CountdownTimer.tsx  # Countdown
│   └── ui/                 # Base components
│
├── hooks/
│   ├── useMatches.ts       # Fetch matches
│   ├── useSignal.ts        # Submit signals
│   ├── useUserSignal.ts    # Check user signals
│   └── useStats.ts         # Platform stats
│
├── lib/
│   ├── contracts.ts        # ABIs and types
│   ├── wagmi.ts            # Wagmi config
│   ├── utils.ts            # Utilities
│   └── football-api.ts     # API client
│
└── public/
    └── .well-known/
        └── farcaster.json  # Mini app manifest
```

## Components

### MatchCard

Displays match information and signal buttons.

```tsx
<MatchCard match={match} index={0} />
```

### SignalBar

Animated percentage bar.

```tsx
<SignalBar
  percentageA={60}
  percentageB={40}
  teamA="Team A"
  teamB="Team B"
  totalSignals={100}
/>
```

### SignalButton

Button for signaling.

```tsx
<SignalButton
  teamName="Team A"
  teamId={1}
  onClick={handleSignal}
  disabled={false}
  isSelected={false}
/>
```

## Hooks

### useMatches

Fetch all matches with real-time updates:

```tsx
const { matches, isLoading } = useMatches();
```

### useSignal

Submit signals:

```tsx
const { signal, isPending, isSuccess } = useSignal();

await signal(matchId, teamId);
```

### useUserSignal

Check if user has signaled:

```tsx
const { hasSignaled, teamChoice } = useUserSignal(matchId);
```

## Styling

### Glassmorphism

```tsx
<div className="glass rounded-2xl p-6">
  Content
</div>
```

### Gradient Text

```tsx
<h1 className="gradient-text">
  Pulseers
</h1>
```

### Signal Bars

```tsx
<div className="signal-bar-a" /> // Blue gradient
<div className="signal-bar-b" /> // Pink gradient
```

## Animations

All animations use Framer Motion:

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

## Mini App Integration

The app automatically detects MiniKit environment:

```tsx
useEffect(() => {
  if (window.minikit) {
    window.minikit.setFrameReady();
  }
}, []);
```

## Football API

Currently using placeholder data. To integrate:

1. Choose API provider
2. Update `lib/football-api.ts`
3. Add API key to `.env.local`
4. Implement fetch methods

## Type Safety

All contract types are auto-generated:

```typescript
import { Match, MatchWithStatus } from "@/lib/contracts";
```

## Performance

- Server-side rendering with Next.js 15
- Automatic code splitting
- Image optimization
- Font optimization with next/font

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Other Platforms

```bash
npm run build
npm start
```

## License

MIT
