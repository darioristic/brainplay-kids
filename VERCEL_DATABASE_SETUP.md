# Vercel Database Setup Guide

Ovaj vodič objašnjava kako da proverite i konfigurišete DATABASE_URL na Vercel-u.

## Korak 1: Pristup Vercel Dashboard-u

1. Idite na [Vercel Dashboard](https://vercel.com/dashboard)
2. Prijavite se sa svojim nalogom
3. Izaberite projekat **brainplay-kids**

## Korak 2: Provera Environment Variables

### 2.1 Navigacija do Environment Variables

1. U projektu, kliknite na **Settings** (u gornjem meniju)
2. U levom sidebar-u, kliknite na **Environment Variables**

### 2.2 Provera DATABASE_URL

1. Potražite `DATABASE_URL` u listi environment variables
2. Proverite da li postoji i da li je postavljen za **Production**, **Preview** i **Development** okruženja

### 2.3 Ako DATABASE_URL ne postoji

1. Kliknite na **Add New** dugme
2. Unesite:
   - **Key**: `DATABASE_URL`
   - **Value**: Vaš PostgreSQL connection string
   - **Environment**: Izaberite Production, Preview, i Development (ili sve tri)
3. Kliknite **Save**

## Korak 3: Format DATABASE_URL

### 3.1 Supabase Connection String

Ako koristite Supabase, format je:

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Primer:**

```
postgresql://postgres.abcdefghijklmnop:your-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### 3.2 Kako dobiti Supabase Connection String

**Metoda 1: Iz Supabase Dashboard-a (Preporučeno)**

1. Idite na [Supabase Dashboard](https://app.supabase.com/)
2. Izaberite vaš projekat (iz vašeg screenshot-a: `vaxwew-saqjis-6hazsy`)
3. Idite na **Settings** → **Database**
4. U sekciji **Connection string**, izaberite **URI**
5. Kopirajte connection string
6. Zamenite `[YOUR-PASSWORD]` sa vašom stvarnom database lozinkom
   - **VAŽNO:** Ovo nije SUPABASE_SERVICE_ROLE_KEY, već database password
   - Ako ne znate password, možete ga resetovati u Settings → Database → Database Password

**Metoda 2: Iz SUPABASE_URL (Ako imate database password)**

Ako već imate `SUPABASE_URL` u Vercel-u (kao što vidim na screenshot-u), možete konstruisati DATABASE_URL:

1. Vaš SUPABASE_URL je: `https://vaxwew-saqjis-6hazsy.supabase.co`
2. Project reference je: `vaxwew-saqjis-6hazsy`
3. DATABASE_URL format:
   ```
   postgresql://postgres.vaxwew-saqjis-6hazsy:[DATABASE_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

**Kako pronaći Database Password:**

1. Idite na Supabase Dashboard → Vaš projekat
2. **Settings** → **Database**
3. U sekciji **Database Password**, kliknite **Reset Database Password** ako ne znate trenutni
4. Kopirajte novi password
5. Koristite ga u DATABASE_URL

### 3.3 Direct Connection (za development)

Za direktnu konekciju (bez pooler-a):

```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

## Korak 4: Provera Connection String-a

### 4.1 Preko Vercel Dashboard

1. U Environment Variables, kliknite na **eye icon** pored `DATABASE_URL` da vidite vrednost
2. Proverite da li:
   - Počinje sa `postgresql://`
   - Sadrži username (obično `postgres`)
   - Sadrži password (ne sme biti `[YOUR-PASSWORD]`)
   - Sadrži hostname (Supabase endpoint)
   - Sadrži port (6543 za pooler, 5432 za direct)
   - Sadrži database name (obično `postgres`)

### 4.2 Preko Health Check Endpoint

Nakon deployment-a, možete proveriti konekciju:

1. Idite na: `https://brainplaykids.com/api/health/db`
2. Trebalo bi da vidite:
   ```json
   {
     "status": "ok",
     "message": "Database connection successful",
     "databaseUrl": true,
     "connection": true
   }
   ```

Ako vidite grešku, proverite:

- Da li je DATABASE_URL postavljen
- Da li je connection string ispravan
- Da li je baza podataka dostupna

### 4.3 Preko Admin Login Stranice

1. Idite na: `https://brainplaykids.com/admin/login`
2. Ako ima problema sa database konekcijom, videćete crveno upozorenje sa instrukcijama

## Korak 5: Redeploy nakon izmene Environment Variables

**VAŽNO:** Nakon što dodate ili promenite environment variables, morate redeploy-ovati aplikaciju:

1. Idite na **Deployments** tab
2. Kliknite na **...** (tri tačke) pored najnovijeg deployment-a
3. Izaberite **Redeploy**
4. Potvrdite redeploy

Ili preko Vercel CLI:

```bash
vercel --prod
```

## Korak 6: Troubleshooting

### Problem: "Database connection error"

**Rešenje:**

1. Proverite da li je DATABASE_URL postavljen u Vercel
2. Proverite format connection string-a
3. Proverite da li je password ispravan
4. Proverite da li Supabase projekat nije pauziran
5. Redeploy-ujte aplikaciju

### Problem: "Authentication failed"

**Rešenje:**

1. Proverite da li je password u connection string-u ispravan
2. Proverite da li koristite pooler connection (port 6543) umesto direct (port 5432)
3. Proverite da li je Supabase projekat aktivan

### Problem: "Can't reach database"

**Rešenje:**

1. Proverite da li je Supabase projekat aktivan (nije pauziran)
2. Proverite da li je hostname ispravan
3. Proverite network connectivity

## Korak 7: Testiranje

Nakon što ste postavili DATABASE_URL i redeploy-ovali:

1. **Test Health Check:**

   ```
   https://brainplaykids.com/api/health/db
   ```

2. **Test Admin Login:**

   ```
   https://brainplaykids.com/admin/login
   ```

3. **Proverite Logs:**
   - Idite na Vercel Dashboard → Vaš projekat → **Logs**
   - Tražite greške vezane za database

## Korak 8: Security Best Practices

1. **Nikada ne commit-ujte DATABASE_URL u git**

   - Proverite da li je `.env` u `.gitignore`
   - Koristite samo Vercel Environment Variables

2. **Koristite različite baze za različita okruženja:**

   - Production: Production Supabase projekat
   - Preview: Test Supabase projekat
   - Development: Lokalna baza ili development Supabase

3. **Rotirajte lozinke redovno:**
   - Promenite Supabase database password
   - Ažurirajte DATABASE_URL u Vercel-u
   - Redeploy-ujte aplikaciju

## Quick Checklist

- [ ] DATABASE_URL postavljen u Vercel Environment Variables
- [ ] Connection string je ispravnog formata
- [ ] Password je ispravan (nije placeholder)
- [ ] Environment variables su postavljeni za Production
- [ ] Aplikacija je redeploy-ovana nakon izmene
- [ ] Health check endpoint vraća success
- [ ] Admin login stranica radi bez grešaka

## Dodatna Pomoć

Ako i dalje imate problema:

1. Proverite Vercel Logs za detaljne greške
2. Proverite Supabase Dashboard → Database → Connection Pooling
3. Kontaktirajte Vercel support ili Supabase support
