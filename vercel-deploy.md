# Vercel Deployment Guide - BrainPlay Kids

Ovaj vodič objašnjava kako da deploy-ujete BrainPlay Kids aplikaciju na Vercel.

## Preduslovi

1. **Vercel CLI** - Instaliran i autentifikovan
2. **Supabase CLI** - Instaliran i autentifikovan
3. **Supabase projekat** - Kreiran na Supabase
4. **GitHub/GitLab/Bitbucket** - Repozitorijum povezan sa Vercel-om

## Korak 1: Priprema Supabase baze podataka

### 1.1 Kreiranje Supabase projekta

```bash
# Login u Supabase CLI
supabase login

# Kreiranje novog projekta (ili koristite postojeći)
supabase projects create brainplay-kids --org-id YOUR_ORG_ID
```

### 1.2 Migracija baze podataka

```bash
# Linkovanje lokalnog projekta sa Supabase projektom
supabase link --project-ref YOUR_PROJECT_REF

# Push migracija na Supabase
supabase db push

# (Opciono) Seed podaci
npm run db:seed
```

### 1.3 Dobijanje connection string-a

1. Idite na Supabase Dashboard → Settings → Database
2. Kopirajte "Connection string" (URI format)
3. Format: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`

## Korak 2: Setup Upstash Redis (za Vercel)

Vercel nema ugrađeni Redis, pa koristimo Upstash Redis:

### 2.1 Kreiranje Upstash Redis instance

1. Idite na [Upstash Console](https://console.upstash.com/)
2. Kreirajte novi Redis database
3. Izaberite region blizu vašeg Vercel region-a
4. Kopirajte Redis URL (format: `redis://default:[PASSWORD]@[ENDPOINT]:[PORT]`)

### 2.2 Alternativa: Supabase Edge Functions

Ako ne želite Upstash, možete koristiti Supabase Edge Functions za caching, ali to zahteva dodatnu implementaciju.

## Korak 3: Environment Variables na Vercel

### 3.1 Preko Vercel Dashboard

1. Idite na Vercel Dashboard → Vaš projekat → Settings → Environment Variables
2. Dodajte sledeće varijable:

```
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
REDIS_URL=redis://default:[PASSWORD]@[ENDPOINT]:[PORT]
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_DOMAIN=brainplaykids.com
NODE_ENV=production
```

### 3.2 Preko Vercel CLI

```bash
# Login u Vercel
vercel login

# Link projekat
vercel link

# Dodavanje environment varijabli
vercel env add DATABASE_URL production
vercel env add REDIS_URL production
vercel env add JWT_SECRET production
vercel env add JWT_REFRESH_SECRET production
vercel env add GEMINI_API_KEY production
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add NEXT_PUBLIC_DOMAIN production
```

## Korak 4: Build Configuration

Projekat je već konfigurisan sa `vercel.json` i `next.config.mjs`. 

**Važno:** 
- `next.config.mjs` koristi `output: 'standalone'` za optimalan build na Vercel-u
- Prisma Client se automatski generiše tokom build procesa

## Korak 5: Deployment

### 5.1 Preko Vercel CLI

```bash
# Deploy na production
vercel --prod

# Ili samo deploy (preview)
vercel
```

### 5.2 Preko Git Integration

1. Push-ujte kod na GitHub/GitLab/Bitbucket
2. Vercel će automatski detektovati promene i deploy-ovati
3. Svaki push na `main` branch će trigger-ovati production deployment

## Korak 6: Subdomain Routing Setup

Za multi-tenant subdomain routing na Vercel-u:

### 6.1 Custom Domain Setup

1. Idite na Vercel Dashboard → Settings → Domains
2. Dodajte glavni domen: `brainplaykids.com`
3. Dodajte wildcard domen: `*.brainplaykids.com`

### 6.2 DNS Configuration

Dodajte sledeće DNS zapise:

```
Type: A
Name: @
Value: 76.76.21.21 (Vercel IP)

Type: CNAME
Name: *
Value: cname.vercel-dns.com
```

### 6.3 Vercel Wildcard Domain

Vercel automatski podržava wildcard subdomains kada dodate `*.yourdomain.com`.

## Korak 7: Post-Deployment Checklist

- [ ] Proverite da li su sve environment varijable postavljene
- [ ] Testirajte glavni domen
- [ ] Testirajte subdomain routing (npr. `test.brainplaykids.com`)
- [ ] Proverite da li Prisma migracije rade
- [ ] Testirajte API endpoints
- [ ] Proverite Redis konekciju
- [ ] Testirajte autentifikaciju
- [ ] Proverite da li Gemini API radi

## Troubleshooting

### Problem: Build fails sa Prisma error

**Rešenje:** Dodajte `postinstall` script u `package.json`:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### Problem: Redis connection error

**Rešenje:** 
- Proverite da li je `REDIS_URL` ispravno postavljen
- Proverite da li Upstash Redis instance radi
- Proverite network access u Upstash konzoli

### Problem: Subdomain routing ne radi

**Rešenje:**
- Proverite DNS konfiguraciju
- Proverite da li je wildcard domen dodat u Vercel
- Proverite `NEXT_PUBLIC_DOMAIN` environment varijablu

### Problem: Database connection timeout

**Rešenje:**
- Koristite Supabase connection pooling URL (port 6543)
- Proverite da li je Supabase projekat aktivan
- Proverite network access u Supabase dashboard-u

## Production Best Practices

1. **Security:**
   - Koristite jake JWT sekrete (min 32 karaktera)
   - Nikada ne commit-ujte `.env` fajlove
   - Koristite Vercel Environment Variables

2. **Performance:**
   - Enable Vercel Analytics
   - Koristite Vercel Edge Functions za kritične rute
   - Optimizujte Prisma queries

3. **Monitoring:**
   - Setup Vercel Logs
   - Integrišite error tracking (Sentry, etc.)
   - Monitor Redis i Database performance

## Dodatni Resursi

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Upstash Redis Documentation](https://docs.upstash.com/redis)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

