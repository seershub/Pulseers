# Paymaster Setup Guide - FREE Transactions! 🎉

## What is Paymaster?

Base Paymaster allows you to **sponsor gas fees** for your users. With your $500 credit from Base, users can signal for FREE!

## How It Works

1. **Without Paymaster:** Users pay ~$0.01-0.05 per signal transaction
2. **With Paymaster:** App pays the gas fee → Users signal for FREE! 🆓

## Setup Steps (5 minutes)

### 1. Get CDP API Key

```bash
1. Go to: https://portal.cdp.coinbase.com/
2. Sign in with Coinbase account
3. Create new project: "Pulseers"
4. Copy your API Key
```

### 2. Add to Vercel Environment Variables

```bash
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add new variable:
   Name: NEXT_PUBLIC_CDP_API_KEY
   Value: <your-api-key-here>
3. Select: Production, Preview, Development
4. Save
```

### 3. Redeploy

Vercel will auto-deploy. Once deployed, **all transactions are FREE!**

## How to Verify It's Working

### Check Console Logs

When users connect, you'll see:
```
✅ Paymaster RPC active - FREE transactions enabled!
```

### Check Transaction

After signaling, check BaseScan:
- Without Paymaster: "Transaction Fee: 0.000012 ETH"
- With Paymaster: "Transaction Fee: 0 ETH (Sponsored)"

## RPC Priority

The app uses this priority for RPC:

```
1. CDP Paymaster RPC (if CDP_API_KEY set) ← FREE transactions!
2. Alchemy RPC (if ALCHEMY_API_KEY set) ← Reliable
3. Custom RPC (if BASE_RPC_URL set)
4. Public RPC (fallback) ← Slow
```

**IMPORTANT:** When CDP key is set, it becomes #1 priority and enables Paymaster!

## Wallet Support

### ✅ Fully Supported (FREE transactions):
- **Coinbase Smart Wallet** (Best choice!)
- **Coinbase Wallet**
- Any wallet via Coinbase Paymaster

### ⚠️ Regular Wallets (Still work, but may not be sponsored):
- MetaMask
- Rainbow
- Zerion
- Other injected wallets

**Recommendation:** Promote Coinbase Smart Wallet to users for best experience.

## Monitoring Usage

### Check Credit Balance

1. Go to: https://portal.cdp.coinbase.com/
2. Check "Paymaster" section
3. See: Used / Total ($500)

### Average Costs

- Signal transaction: ~$0.01-0.02
- With $500 credit: **25,000 - 50,000 free signals!**

## Troubleshooting

### Paymaster Not Working?

Check these:

1. **Environment Variable Set?**
   ```bash
   # In Vercel, verify:
   NEXT_PUBLIC_CDP_API_KEY=sk_live_...
   ```

2. **Redeployed After Adding?**
   - Must redeploy for env vars to take effect

3. **Console Shows Paymaster Active?**
   ```
   ✅ Paymaster RPC active - FREE transactions enabled!
   ```

4. **Using Supported Wallet?**
   - Best: Coinbase Smart Wallet
   - Okay: Coinbase Wallet, other wallets

### Still Paying Gas?

Some wallets may not fully support Paymaster sponsoring. This is normal. The majority of users with Coinbase wallets will get free transactions.

## Cost Estimates

### Without Paymaster
- 1,000 signals = $10-20 in gas fees (paid by users)
- Users must have ETH in wallet
- May prevent signaling if no ETH

### With Paymaster
- 25,000+ signals = $0 for users! 🎉
- No ETH needed by users
- Smooth UX, higher engagement

## When Credit Runs Out

When your $500 credit is exhausted:

1. Paymaster automatically disables
2. App falls back to normal mode (users pay gas)
3. You can top up or let users pay

**Note:** $500 lasts a LONG time (25k-50k signals)!

## Summary

✅ Add `NEXT_PUBLIC_CDP_API_KEY` to Vercel
✅ Redeploy
✅ FREE transactions enabled!
✅ Monitor usage at portal.cdp.coinbase.com

**Your users will love not paying gas fees! 🚀**
