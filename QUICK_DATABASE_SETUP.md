# Quick Database Setup - Za tvoj Supabase projekat

Vidim da si već dodao Supabase environment variables u Vercel. Sada treba da dodaš `DATABASE_URL`.

## 🚀 Brza metoda - Preko CLI skripte

Najlakše je da koristiš automatsku skriptu:

```bash
./scripts/setup-vercel-database.sh
```

Skripta će te pitati za:

- Database password (iz Supabase Dashboard-a)
- Region (ili će koristiti default)
- Tip konekcije (pooler ili direct)

I automatski će postaviti DATABASE_URL u Vercel za sve environment-e!

## 📝 Ručna metoda

## Korak 1: Dobij Database Password

1. Idite na [Supabase Dashboard](https://app.supabase.com/)
2. Izaberite projekat sa URL-om: `vaxwew-saqjis-6hazsy.supabase.co`
3. Idite na **Settings** → **Database**
4. U sekciji **Database Password**:
   - Ako ne znate password, kliknite **Reset Database Password**
   - Kopirajte password (neće se više prikazati!)

## Korak 2: Konstruiši DATABASE_URL

Na osnovu tvog Supabase URL-a, DATABASE_URL treba da bude:

```
postgresql://postgres.vaxwew-saqjis-6hazsy:[Tvoj_Database_Password]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Primer:**

```
postgresql://postgres.vaxwew-saqjis-6hazsy:mojaLozinka123@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Kako pronaći REGION:**

- U Supabase Dashboard → Settings → Database
- Pogledaj "Connection string" sekciju - region je deo hostname-a
- Obično je: `us-east-1`, `eu-west-1`, `ap-southeast-1`, itd.

## Korak 3: Dodaj u Vercel

1. U Vercel Dashboard → Settings → Environment Variables
2. Kliknite **Add New**
3. Unesite:
   - **Key**: `DATABASE_URL`
   - **Value**: Connection string iz koraka 2
   - **Environment**: Production, Preview, Development (sve tri)
4. Kliknite **Save**

## Korak 4: Redeploy

1. Idite na **Deployments** tab
2. Kliknite **...** pored najnovijeg deployment-a
3. Izaberite **Redeploy**

## Korak 5: Proveri

1. Otvori: `https://brainplaykids.com/api/health/db`
2. Trebalo bi da vidiš:
   ```json
   {
     "status": "ok",
     "message": "Database connection successful",
     "connection": true
   }
   ```

## Troubleshooting

**Ako dobiješ "Authentication failed":**

- Proveri da li si koristio **Database Password**, a ne SUPABASE_SERVICE_ROLE_KEY
- Proveri da li je password ispravno kopiran (bez razmaka)

**Ako dobiješ "Can't reach database":**

- Proveri da li si koristio pooler connection (port 6543)
- Proveri da li je region ispravan u hostname-u

**Ako ne znaš region:**

- U Supabase Dashboard → Settings → Database
- Pogledaj "Connection string" sekciju
- Ili koristi direct connection (port 5432) umesto pooler-a:
  ```
  postgresql://postgres.vaxwew-saqjis-6hazsy:[PASSWORD]@db.vaxwew-saqjis-6hazsy.supabase.co:5432/postgres
  ```
