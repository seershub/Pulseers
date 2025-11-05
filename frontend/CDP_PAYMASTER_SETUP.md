# CDP Paymaster Setup - Adım Adım Kılavuz

## CDP Panel Ayarları

### 1. Contract Allowlist Ayarları

CDP Panel'de **Contract allowlist** bölümüne şunları ekleyin:

#### Contract Information:
```
Name: Pulseers Contract
Contract Address: 0xDB92bc5D7Eee9397d4486EF1d6fbB3DD68bEb640
Chain: Base Mainnet
```

#### Functions to Allowlist:

**Function 1:**
```
Function Selector: 0x1e9564ee
Function Signature: signal(uint256,uint8)
Description: Allow users to signal for matches
```

**NASIL BULDUM:**
```javascript
// signal(uint256 _matchId, uint8 _teamId) function'ının selector'ı
// Keccak256("signal(uint256,uint8)") → ilk 4 byte
// Result: 0x1e9564ee
```

### 2. Enable Paymaster

CDP Panel'de şu ayarları yapın:

```
✅ Enable Paymaster: ON
✅ Paymaster Endpoint: https://api.developer.coinbase.com/rpc/v1/base/DzCv9JnMZKpreOiukHveGNUBbW7NBYUa
✅ Contract Allowlist: Enabled
✅ Gas Policy: Unlimited (or set limit)
```

### 3. Vercel Environment Variables

`.env` veya Vercel Dashboard → Environment Variables:

```bash
NEXT_PUBLIC_CDP_API_KEY=DzCv9JnMZKpreOiukHveGNUBbW7NBYUa
```

---

## Function Selector Nedir?

Function selector, smart contract function'larını tanımlayan 4-byte hex kodu:

```
signal(uint256,uint8) → 0x1e9564ee
```

Bu, Paymaster'a "sadece bu function'a gas sponsor et" demeye yarar.

---

## Kontrol Et

### Allowlist'te Ne Olmalı?

CDP Panel'de Contract Allowlist şöyle görünmeli:

| Name | Contract Address | Functions |
|------|-----------------|-----------|
| Pulseers Contract | 0xDB92bc5D7Eee9397d4486EF1d6fbB3DD68bEb640 | 1 function |

Function'a tıkladığında:
- **Selector:** `0x1e9564ee`
- **Signature:** `signal(uint256,uint8)`

### Test Et

1. Vercel'e deploy et
2. Coinbase Smart Wallet ile bağlan
3. Bir maça signal at
4. Console'da şunu göreceksin:
   ```
   ✅ Paymaster RPC active - FREE transactions enabled!
   ```
5. Transaction başarılı olursa → **GAS FEE: $0.00** (Sponsored!)

---

## Sorun Giderme

### ❌ "Paymaster rejected the request"
**Çözüm:** Contract allowlist'e ekle, function selector doğru mu kontrol et

### ❌ "Still paying gas fees"
**Çözüm:**
1. CDP API Key Vercel'de mi?
2. Redeployed mi?
3. Smart Wallet kullanıyor musun? (Regular wallet Paymaster desteklemeyebilir)

### ❌ "Function not in allowlist"
**Çözüm:** Function selector: `0x1e9564ee` olmalı

---

## Diğer Function'lar İçin Selector Bulma

Başka function'lar da sponsor etmek istersen:

```bash
# Node.js veya browser console'da
const ethers = require('ethers');

// Function signature → selector
ethers.utils.id("functionName(uint256,address)").slice(0, 10);
// → "0xabcdef12"
```

Ya da: https://www.4byte.directory/

---

## Özet

✅ Contract: `0xDB92bc5D7Eee9397d4486EF1d6fbB3DD68bEb640`
✅ Function: `0x1e9564ee` (signal)
✅ CDP Key: Vercel'de set
✅ Paymaster: Enabled

**Artık kullanıcılar ÜCRETSİZ signal atabilir!** 🎉
