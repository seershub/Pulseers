# 🚀 Deployment Guide - Pulseers

Complete step-by-step guide to deploy Pulseers to production.

## Prerequisites

- [ ] Node.js 18+ installed
- [ ] Base Sepolia ETH for testnet (get from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))
- [ ] Private key for deployment wallet
- [ ] BaseScan API key ([Get one here](https://basescan.org/apis))
- [ ] Coinbase Developer Platform API key ([Get one here](https://portal.cdp.coinbase.com/))

## Phase 1: Smart Contract Deployment

### Step 1: Install Dependencies

```bash
cd contracts
npm install
```

### Step 2: Configure Environment

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# RPC URLs
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_RPC_URL=https://mainnet.base.org

# Deployment wallet private key (KEEP SECURE!)
PRIVATE_KEY=your_private_key_here

# BaseScan API key for verification
BASESCAN_API_KEY=your_basescan_api_key
```

### Step 3: Test Contract

Run tests to ensure everything works:

```bash
npm run test
```

Expected output:
```
  Pulseers
    Initialization
      ✓ Should set the correct owner
      ✓ Should start with zero stats
    Adding Matches
      ✓ Should add matches successfully
      ...

  30 passing (2s)
```

### Step 4: Deploy to Base Sepolia (Testnet)

```bash
npm run deploy:sepolia
```

**Save the output:**
```
✅ Pulseers proxy deployed to: 0xYourProxyAddress
📦 Implementation deployed to: 0xYourImplementationAddress
```

### Step 5: Verify Contract

```bash
npx hardhat verify --network baseSepolia 0xYourImplementationAddress
```

### Step 6: Add Test Matches

Edit `scripts/add-matches.ts` with real football match data, then run:

```bash
node scripts/add-matches.ts
```

### Step 7: Test on BaseScan

Visit: `https://sepolia.basescan.org/address/0xYourProxyAddress`

- Verify contract is verified ✓
- Check matches were added ✓
- Test `signal` function ✓

---

## Phase 2: Frontend Deployment

### Step 1: Install Dependencies

```bash
cd ../frontend
npm install
```

### Step 2: Configure Environment

Create `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# Contract Address (from Phase 1)
NEXT_PUBLIC_PULSEERS_ADDRESS=0xYourProxyAddress
NEXT_PUBLIC_CHAIN_ID=84532  # Base Sepolia

# Coinbase Developer Platform
NEXT_PUBLIC_CDP_API_KEY=your_cdp_api_key

# Optional: WalletConnect
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id

# App URL (update after deployment)
NEXT_PUBLIC_URL=https://pulseers.seershub.com
```

### Step 3: Test Locally

```bash
npm run dev
```

Open `http://localhost:3000`

**Test checklist:**
- [ ] Connect wallet works
- [ ] Matches load from contract
- [ ] Signal buttons work
- [ ] Percentages update
- [ ] Animations are smooth
- [ ] Responsive on mobile

### Step 4: Build for Production

```bash
npm run build
```

Fix any TypeScript errors if they appear.

### Step 5: Deploy to Vercel

**Option A: Via Vercel CLI**

```bash
npm install -g vercel
vercel login
vercel
```

**Option B: Via GitHub**

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import repository
4. Add environment variables from `.env.local`
5. Deploy

### Step 6: Configure Domain

In Vercel dashboard:
1. Go to Settings → Domains
2. Add custom domain: `pulseers.seershub.com`
3. Follow DNS instructions
4. Wait for SSL certificate

### Step 7: Update Environment Variables

Update `.env.local` with production URL:

```env
NEXT_PUBLIC_URL=https://pulseers.seershub.com
```

Redeploy:
```bash
vercel --prod
```

---

## Phase 3: Mini App Configuration

### Step 1: Generate Manifest

```bash
npx onchainkit manifest
```

Follow the prompts:
- App name: Pulseers
- App URL: https://pulseers.seershub.com
- Icon URL: https://pulseers.seershub.com/icon-512.png

### Step 2: Update Farcaster Manifest

Edit `frontend/public/.well-known/farcaster.json`:

```json
{
  "accountAssociation": {
    "header": "...",
    "payload": "...",
    "signature": "..."
  },
  "frame": {
    "version": "1",
    "name": "Pulseers",
    "iconUrl": "https://pulseers.seershub.com/icon-512.png",
    "splashImageUrl": "https://pulseers.seershub.com/splash.png",
    "splashBackgroundColor": "#0a0f1e",
    "homeUrl": "https://pulseers.seershub.com",
    "webhookUrl": "https://pulseers.seershub.com/api/webhook"
  }
}
```

### Step 3: Create App Icons

Create these files in `frontend/public/`:

- `icon-512.png` - 512x512 app icon
- `splash.png` - 1200x630 splash screen
- `og-image.png` - 1200x630 Open Graph image

### Step 4: Deploy Updated Manifest

```bash
git add .
git commit -m "Add Mini App manifest"
git push
```

Vercel will auto-deploy.

### Step 5: Test Mini App

**Test in Warpcast:**
1. Open Warpcast mobile app
2. Go to https://pulseers.seershub.com
3. Verify it loads as Mini App
4. Test wallet connection
5. Test signaling

**Test in Base App:**
1. Open Base app
2. Navigate to Mini Apps
3. Add Pulseers
4. Test functionality

---

## Phase 4: Mainnet Deployment (When Ready)

⚠️ **Only deploy to mainnet after thorough testnet testing!**

### Step 1: Deploy Contract to Base Mainnet

```bash
cd contracts
npm run deploy:mainnet
```

### Step 2: Verify on BaseScan

```bash
npx hardhat verify --network base 0xYourImplementationAddress
```

### Step 3: Update Frontend Environment

```env
NEXT_PUBLIC_PULSEERS_ADDRESS=0xMainnetProxyAddress
NEXT_PUBLIC_CHAIN_ID=8453  # Base Mainnet
```

### Step 4: Deploy Frontend

```bash
cd frontend
vercel --prod
```

### Step 5: Add Real Matches

Use the production Football API to add real matches:

```bash
node scripts/add-matches.ts
```

---

## Post-Deployment Checklist

### Smart Contract
- [ ] Contract deployed and verified on BaseScan
- [ ] Owner can add matches
- [ ] Users can signal
- [ ] Percentages calculate correctly
- [ ] Events emit properly

### Frontend
- [ ] App loads on production URL
- [ ] Wallet connection works
- [ ] Matches load from contract
- [ ] Signals submit successfully
- [ ] Real-time updates work
- [ ] Mobile responsive
- [ ] Animations smooth

### Mini App
- [ ] Manifest is valid
- [ ] Works in Warpcast
- [ ] Works in Base App
- [ ] Profile displays correctly
- [ ] Splash screen shows

### SEO & Social
- [ ] OG image displays on Twitter/Discord
- [ ] Meta tags correct
- [ ] Analytics setup (optional)
- [ ] Error tracking setup (optional)

---

## Maintenance

### Adding Matches Weekly

Create a cron job or run manually:

```bash
cd contracts
node scripts/add-matches.ts
```

### Monitoring

- Check BaseScan for contract activity
- Monitor Vercel logs for errors
- Track gas usage
- Monitor user signals

### Upgrading Contract

If you need to upgrade:

```bash
cd contracts
npm run upgrade:sepolia  # Test first
npm run upgrade:mainnet  # Then mainnet
```

---

## Troubleshooting

### "Insufficient funds for gas"
- Get more ETH from faucet (testnet)
- Transfer ETH to deployment wallet (mainnet)

### "Transaction underpriced"
- Increase gas price in Hardhat config
- Wait for lower network congestion

### "Contract not verified"
- Check API key is correct
- Ensure constructor arguments match
- Try manual verification on BaseScan

### "Matches not loading"
- Check contract address is correct
- Verify chain ID matches network
- Check wallet is on correct network

### "Signals not submitting"
- Ensure wallet has ETH for gas
- Check match hasn't started/ended
- Verify user hasn't already signaled

---

## Support

If you encounter issues:

1. Check the [README](./README.md)
2. Review [contract docs](./contracts/README.md)
3. Review [frontend docs](./frontend/README.md)
4. Open an issue on GitHub

---

## Security Notes

⚠️ **Important Security Practices:**

1. **Never commit private keys** - Use `.env` files (gitignored)
2. **Use hardware wallet** for mainnet deployment
3. **Test thoroughly** on testnet first
4. **Verify contracts** on BaseScan
5. **Monitor for unusual activity**
6. **Keep dependencies updated**

---

## Cost Estimates

### Deployment Costs (Base Sepolia)
- Contract deployment: ~$0 (testnet)
- Vercel hosting: Free tier available

### Deployment Costs (Base Mainnet)
- Contract deployment: ~$50-100 (depending on gas)
- Adding 10 matches: ~$5-10
- Vercel hosting: $20/month (Pro) or Free

### User Costs
- Signal: ~$0.02-0.05 per signal
- No other fees

---

**Ready to deploy?** Follow the phases in order and check off each step. Good luck! 🚀
