# 🚀 Pulseers Deployment Checklist

## ✅ Completed Items

- [x] Smart contracts deployed to Base Mainnet
- [x] Frontend code complete with all features
- [x] Admin panel for adding matches
- [x] Farcaster Mini App manifests created
- [x] Base Mini App configuration added
- [x] Wagmi + Viem integration
- [x] OnchainKit integration
- [x] Football Data API integration

## 🔧 CRITICAL: Fix Required Issues

### 1. ❌ **MAÇLAR GÖRÜNMÜYOR - Environment Variables Eksik!**

**Vercel Dashboard → Settings → Environment Variables** bölümüne GİT ve şunları ekle:

```env
NEXT_PUBLIC_PULSEERS_ADDRESS=0xDB92bc5D7Eee9397d4486EF1d6fbB3DD68bEb640
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_CDP_API_KEY=<your-coinbase-api-key>
NEXT_PUBLIC_WC_PROJECT_ID=<your-walletconnect-project-id>
NEXT_PUBLIC_FOOTBALL_API_KEY=<your-football-data-api-key>
NEXT_PUBLIC_URL=https://pulseers.seershub.com
NEXT_PUBLIC_APP_NAME=Pulseers
NEXT_PUBLIC_APP_DESCRIPTION=Signal your support for your favorite teams on-chain
```

**ÖNEMLİ**: Bu değişkenleri ekledikten sonra **REDEPLOY** et!

---

### 2. 🎨 **Icon Dosyaları Oluşturulmalı**

`/frontend/public/` klasörüne şu dosyaları ekle:

- [ ] `icon-192x192.png` (192x192px) - App icon
- [ ] `icon-512x512.png` (512x512px) - App icon high-res
- [ ] `og-image.png` (1200x630px) - Social sharing image
- [ ] `splash.png` (1080x1920px) - Mini App splash screen

**Nasıl oluşturulur?** → `public/ICONS_README.md` dosyasına bak!

**Geçici Çözüm**: Basit renkli placeholders kullan, sonra profesyonel tasarımlarla değiştir.

---

### 3. 🔄 **Farcaster Manifest URL'leri Güncelle**

`/frontend/public/.well-known/farcaster.json` dosyasını aç ve `pulseers.seershub.com` kısımlarını gerçek domain'inle değiştir:

```json
{
  "frame": {
    "iconUrl": "https://pulseers.seershub.com/icon-512x512.png",
    "splashImageUrl": "https://pulseers.seershub.com/splash.png",
    "homeUrl": "https://pulseers.seershub.com"
  }
}
```

**GERÇEK-DOMAIN**: Vercel'de projenin asıl URL'i (örn: `pulseers.vercel.app`)

---

## 🎯 Test Checklist

Deploy edildikten sonra test et:

### Frontend Tests
- [ ] Ana sayfa açılıyor
- [ ] Cüzdan bağlanabiliyor
- [ ] **MAÇLAR GÖRÜNmeli!** (Environment variables doğru ise)
- [ ] Maçlara signal gönderilebiliyor
- [ ] Percentages güncelleniyor

### Mini App Tests
- [ ] `/manifest.json` erişilebilir
- [ ] `/.well-known/farcaster.json` erişilebilir
- [ ] Farcaster client'ta açılıyor
- [ ] Base Mini App olarak çalışıyor
- [ ] Icon'lar doğru görünüyor

### Admin Panel Tests
- [ ] `/admin` sayfası açılıyor
- [ ] Private key ile giriş yapılabiliyor
- [ ] Maçlar eklenebiliyor
- [ ] Transaction başarılı oluyor

---

## 📊 Current Status

**Contract**: ✅ Deployed at `0xDB92bc5D7Eee9397d4486EF1d6fbB3DD68bEb640`  
**Frontend**: ⚠️ Deployed but matches not showing (ENV vars missing)  
**Mini App Config**: ✅ Files created (icons pending)  
**Admin Panel**: ✅ Working

---

## 🚨 Why Matches Are NOT Showing

**Problem**: Frontend reads contract address from environment variable  
**Current State**: Variable not set → defaults to `0x0000...` → no matches found  
**Solution**: Add `NEXT_PUBLIC_PULSEERS_ADDRESS` to Vercel → Redeploy

**Code causing issue**:
```typescript
// frontend/lib/contracts.ts
export const PULSEERS_ADDRESS =
  (process.env.NEXT_PUBLIC_PULSEERS_ADDRESS as `0x${string}`) ||
  "0x0000000000000000000000000000000000000000";  // ⬅️ THIS IS BEING USED!
```

---

## 🎉 After Fixing

1. Add all environment variables to Vercel
2. Create icon files (or use placeholders temporarily)
3. Update farcaster.json with real domain
4. Redeploy
5. Open app → Matches should appear!
6. Test in Farcaster client
7. Share with users! ⚽

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify environment variables in Vercel
3. Check contract on BaseScan: https://basescan.org/address/0xDB92bc5D7Eee9397d4486EF1d6fbB3DD68bEb640
4. Test admin panel at `/admin`

