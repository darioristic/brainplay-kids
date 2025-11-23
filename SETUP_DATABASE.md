# Database Setup - Brzi Vodič

## 🚀 Najbrži način (1 komanda)

1. **Dobij Database Password:**
   - Otvori: https://app.supabase.com/project/vaxwew-saqjis-6hazsy/settings/database
   - U sekciji "Database Password", klikni "Reset Database Password" ako ne znaš
   - Kopiraj password

2. **Pokreni skriptu:**
   ```bash
   ./scripts/setup-database-quick.sh "tvoj-password" "us-east-1"
   ```
   
   Primer:
   ```bash
   ./scripts/setup-database-quick.sh "mojaLozinka123" "us-east-1"
   ```

3. **Redeploy:**
   ```bash
   vercel --prod
   ```

4. **Proveri:**
   - Otvori: https://brainplaykids.com/api/health/db
   - Trebalo bi da vidiš: `{"status":"ok","connection":true}`

## 📋 Kako pronaći Region

Ako ne znaš region:
1. Idite na Supabase Dashboard → Settings → Database
2. Pogledaj "Connection string" sekciju
3. Region je deo hostname-a (npr. `aws-0-us-east-1` = `us-east-1`)

Najčešći regioni:
- `us-east-1` (US East) - najčešći
- `eu-west-1` (EU West)
- `ap-southeast-1` (Asia Pacific)

## 🔧 Alternativne metode

### Metoda 1: Interaktivna skripta
```bash
./scripts/setup-vercel-database.sh
```
Skripta će te pitati za sve potrebne informacije.

### Metoda 2: Ručno preko Vercel CLI
```bash
# Zameni [PASSWORD] i [REGION]
echo "postgresql://postgres.vaxwew-saqjis-6hazsy:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres" | vercel env add DATABASE_URL production
echo "postgresql://postgres.vaxwew-saqjis-6hazsy:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres" | vercel env add DATABASE_URL preview
echo "postgresql://postgres.vaxwew-saqjis-6hazsy:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres" | vercel env add DATABASE_URL development
```

### Metoda 3: Preko Vercel Dashboard
1. Vercel Dashboard → Settings → Environment Variables
2. Add New → Key: `DATABASE_URL`
3. Value: `postgresql://postgres.vaxwew-saqjis-6hazsy:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
4. Environment: Production, Preview, Development
5. Save

## ✅ Provera

Nakon postavljanja, proveri:

```bash
# Proveri da li je postavljen
vercel env ls | grep DATABASE_URL

# Testiraj konekciju
curl https://brainplaykids.com/api/health/db
```

## 🆘 Troubleshooting

**"Database configuration error"**
- Proveri da li je DATABASE_URL postavljen: `vercel env ls`
- Proveri da li si redeploy-ovao nakon postavljanja

**"Authentication failed"**
- Proveri da li si koristio Database Password (ne SUPABASE_SERVICE_ROLE_KEY)
- Proveri da li je password ispravno kopiran (bez razmaka)

**"Can't reach database"**
- Proveri da li je region ispravan
- Proveri da li Supabase projekat nije pauziran

