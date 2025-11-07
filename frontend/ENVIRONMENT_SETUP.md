# Pulseers Environment Setup Guide

## Critical Environment Variables

### 🔴 REQUIRED for Production

#### 1. Alchemy API Key (HIGHEST PRIORITY)
```env
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here
```

**Why it's needed:**
- Default public Base RPC is unreliable and rate-limited
- Alchemy provides stable, fast RPC access to Base Mainnet
- **WITHOUT THIS, MATCHES WILL NOT LOAD FROM CONTRACT**

**How to get it:**
1. Go to https://www.alchemy.com/
2. Sign up (free tier is sufficient)
3. Create a new app on "Base Mainnet"
4. Copy the API key
5. Add to Vercel: `Settings → Environment Variables → NEXT_PUBLIC_ALCHEMY_API_KEY`

#### 2. Football Data API Key
```env
NEXT_PUBLIC_FOOTBALL_API_KEY=your_football_data_api_key_here
```

**Why it's needed:**
- Fetches real match data for admin panel
- Without this, admin can't add new matches

**How to get it:**
1. Go to https://www.football-data.org/
2. Register for free account
3. Get your API key from dashboard
4. Add to Vercel: `Settings → Environment Variables → NEXT_PUBLIC_FOOTBALL_API_KEY`

**Note:** Free tier allows 10 requests/minute - perfect for this app

### 🟡 ALREADY CONFIGURED (Check these are correct)

```env
# Contract Configuration
NEXT_PUBLIC_PULSEERS_ADDRESS=0xDB92bc5D7Eee9397d4486EF1d6fbB3DD68bEb640
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_DEPLOYMENT_BLOCK=22547651

# App Configuration
NEXT_PUBLIC_URL=https://pulseers.seershub.com
NEXT_PUBLIC_APP_NAME=Pulseers
NEXT_PUBLIC_APP_DESCRIPTION=Signal your support for your favorite teams on-chain
```

### 🟢 OPTIONAL (Recommended)

```env
# WalletConnect Project ID (for better wallet support)
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id

# Coinbase Developer Platform API Key
NEXT_PUBLIC_CDP_API_KEY=your_cdp_key_here

# Custom RPC (if you have your own)
NEXT_PUBLIC_BASE_RPC_URL=https://your-custom-rpc.com
```

## Current Issues & Solutions

### Issue 1: Matches Not Loading
**Symptom:** No matches appear on homepage, or old/stale matches show

**Root Cause:** Missing `NEXT_PUBLIC_ALCHEMY_API_KEY`

**Solution:** Add Alchemy API key to Vercel environment variables

**Fallback RPC Priority:**
1. Alchemy (if key provided) ← **BEST**
2. Custom RPC (if NEXT_PUBLIC_BASE_RPC_URL provided)
3. LlamaRPC Public (free, but may be slow)

### Issue 2: Admin Panel Can't Add Matches
**Symptom:** Admin panel returns error about mock data

**Root Cause:** Missing `NEXT_PUBLIC_FOOTBALL_API_KEY`

**Solution:** Add Football Data API key to Vercel environment variables

### Issue 3: Match Signal Buttons Disabled
**Symptom:** Signal buttons are grayed out

**Possible Causes:**
1. Wallet not connected
2. User already signaled this match
3. Match is finished (not active)

**How buttons work:**
```typescript
disabled={
  isPending ||        // Transaction in progress
  hasSignaled ||      // Already signaled this match
  !walletConnected    // No wallet connected
}
```

### Issue 4: Player Signals Not Writing On-Chain
**Symptom:** Player signal button works, shows success, but no transaction

**Root Cause:** Player matchIds (9000000000+) don't exist in contract yet

**Solution:** Admin must add player "virtual matches" first

**Player MatchIds:**
- `arda-guler` → 9000795967
- `kylian-mbappe` → 9000193399
- `lamine-yamal` → 9000556558
- `kenan-yildiz` → 9000506025

To add these matches, admin should call:
```typescript
contract.addMatches(
  [9000795967n, 9000193399n, 9000556558n, 9000506025n],
  ["Arda Güler", "Kylian Mbappé", "Lamine Yamal", "Kenan Yıldız"],
  ["Player Signal", "Player Signal", "Player Signal", "Player Signal"],
  ["Top Players", "Top Players", "Top Players", "Top Players"],
  ["/6.png", "/7.png", "/8.png", "/9.png"],
  ["", "", "", ""],
  [2147483647n, 2147483647n, 2147483647n, 2147483647n] // Far future
);
```

## Vercel Deployment Steps

1. **Add Environment Variables**
   - Go to Vercel Dashboard
   - Select your project (Pulseers)
   - Settings → Environment Variables
   - Add all REQUIRED variables above
   - Make sure to select "Production", "Preview", and "Development"

2. **Redeploy**
   - Vercel will automatically redeploy when you push to git
   - OR manually trigger redeploy from Vercel Dashboard

3. **Verify**
   - Visit https://pulseers.seershub.com
   - Open browser console (F12)
   - Check for errors
   - Try to signal a match

## Debug Checklist

If matches still don't load after adding Alchemy key:

- [ ] Alchemy key is correct (test it at https://dashboard.alchemy.com/)
- [ ] Environment variable is named exactly `NEXT_PUBLIC_ALCHEMY_API_KEY`
- [ ] Variable is set for "Production" environment
- [ ] Redeployed after adding variable
- [ ] No typos in contract address: `0xDB92bc5D7Eee9397d4486EF1d6fbB3DD68bEb640`
- [ ] Check Vercel deployment logs for errors

If signal buttons don't work:

- [ ] Wallet is connected (check header)
- [ ] On correct network (Base Mainnet - Chain ID 8453)
- [ ] Haven't already signaled this match
- [ ] Match is active (not finished)
- [ ] Browser console shows no errors

## Support

- Contract on BaseScan: https://basescan.org/address/0xDB92bc5D7Eee9397d4486EF1d6fbB3DD68bEb640
- Check API health: https://pulseers.seershub.com/api/matches
- Check admin panel: https://pulseers.seershub.com/api/admin/add-matches (GET request)
