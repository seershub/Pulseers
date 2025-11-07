# 🔧 Football API Setup Guide

## Problem
Admin panelde yeni maç eklerken "Error: No matches found from API" hatası alıyorsunuz.

## Neden?
`NEXT_PUBLIC_FOOTBALL_API_KEY` environment variable'ı Vercel'de ayarlanmamış.

---

## ✅ ÇÖZÜM: Football API Key Alma (ÜCRETSIZ)

### Adım 1: Football-Data.org'dan Ücretsiz API Key Alın

1. **Kayıt Olun:**
   - https://www.football-data.org/client/register
   - Email ile ücretsiz kayıt

2. **Email Doğrula:**
   - Gelen mailde activation link'e tıklayın

3. **API Key Alın:**
   - Login olduktan sonra: https://www.football-data.org/client/home
   - "Your API Token" altında key'iniz görünür
   - Format: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (32 karakter)

4. **Ücretsiz Tier Limitleri:**
   - ✅ 10 request/dakika
   - ✅ Tüm büyük ligler (Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Champions League)
   - ✅ Son 2 yıllık data
   - ✅ Live scores
   - **Pulseers için yeterli!**

---

### Adım 2: Vercel'e API Key Ekleyin

1. **Vercel Dashboard'a Gidin:**
   ```
   https://vercel.com/seershub/pulseers/settings/environment-variables
   ```

2. **Environment Variable Ekleyin:**
   - **Key:** `NEXT_PUBLIC_FOOTBALL_API_KEY`
   - **Value:** Your API key (32 karakter)
   - **Environments:** Production, Preview, Development (HEPSİNİ seçin)

3. **Kaydedin:**
   - "Save" butonuna tıklayın

---

### Adım 3: Yeniden Deploy Edin

**Vercel otomatik deploy yapmaz environment variable değişikliklerinde!**

**İki yöntem:**

**A) Vercel Dashboard'dan:**
```
Deployments sekmesi → Son deployment'ın sağındaki "..." → Redeploy
```

**B) Git push ile:**
```bash
git commit --allow-empty -m "Redeploy for Football API key"
git push origin main
```

---

### Adım 4: Test Edin

1. **https://pulseers.seershub.com/admin** sayfasına gidin
2. Admin private key girin
3. "Add Matches to Contract" butonuna basın
4. ✅ Gerçek maçlar eklenecek (Mock data değil!)

---

## 🧪 API Key Test (Opsiyonel)

API key'in çalışıp çalışmadığını test edin:

```bash
curl -X GET 'https://api.football-data.org/v4/competitions/PL/matches' \
  -H 'X-Auth-Token: YOUR_API_KEY'
```

Başarılı yanıt: JSON formatında Premier League maçları

---

## 🚨 Hala Çalışmıyorsa

### Kontrol Listesi:

1. **Environment variable doğru yazıldı mı?**
   - ✅ `NEXT_PUBLIC_FOOTBALL_API_KEY` (tam bu şekilde, alt çizgi ve büyük harfler önemli!)

2. **API key doğru kopyalandı mı?**
   - ❌ Başında/sonunda boşluk olmasın
   - ❌ Eksik karakter olmasın (32 karakter olmalı)

3. **Redeploy yapıldı mı?**
   - Environment variable değişikliğinden sonra **mutlaka** redeploy gerekli

4. **Vercel build logs kontrol:**
   ```
   Vercel Dashboard → Deployments → Son deployment → Building
   ```
   - "NEXT_PUBLIC_FOOTBALL_API_KEY" yazıyor mu?

---

## 📝 Alternatif: Development Mode (Geliştirme Ortamı)

Eğer hemen API key alamıyorsanız, development mode'da test edebilirsiniz:

**Local development:**
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local and add your API key
npm run dev
```

Production'da API key **zorunlu** - mock data kullanılamaz.

---

## 🎯 Özet

1. https://www.football-data.org/client/register → Ücretsiz kayıt
2. Email doğrula → API key al
3. Vercel → Environment Variables → `NEXT_PUBLIC_FOOTBALL_API_KEY` ekle
4. Redeploy et
5. Admin panelde test et

**Süre:** 5-10 dakika
**Ücret:** Tamamen ücretsiz
**Sonuç:** Gerçek maçlar ekleyebileceksiniz!

---

## 📞 Destek

Sorun devam ederse:
- Vercel build logs'u kontrol edin
- Browser console'da hata mesajlarını inceleyin
- API key'in aktif olduğundan emin olun (football-data.org'da)
