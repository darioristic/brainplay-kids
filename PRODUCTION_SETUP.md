# Production Setup Guide

Ovaj vodič objašnjava kako da konfigurišete aplikaciju za rad na production domenu `https://brainplaykids.com`.

## Environment Variables

U Vercel Dashboard-u, postavite sledeće environment varijable:

### Obavezne Varijable

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Redis (Upstash ili drugi Redis provider)
REDIS_URL=redis://default:password@host:port

# JWT Secrets (generišite jake random stringove)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key-here
```

### Opcione Varijable (sa default vrednostima)

```bash
# Application URL (automatski se detektuje u browser-u)
NEXT_PUBLIC_APP_URL=https://brainplaykids.com

# Main domain za subdomain routing
NEXT_PUBLIC_DOMAIN=brainplaykids.com
```

## DNS Konfiguracija

Za subdomain routing da radi na production, potrebno je konfigurisati DNS:

### Wildcard DNS Record

Dodajte wildcard A record ili CNAME record:

```
*.brainplaykids.com  ->  Vercel IP ili CNAME
```

Ili ako koristite Vercel:

```
*.brainplaykids.com  ->  cname.vercel-dns.com
```

### Main Domain

```
brainplaykids.com  ->  Vercel IP ili CNAME
```

## Vercel Konfiguracija

1. **Dodajte domenu u Vercel:**

   - Idite na Project Settings → Domains
   - Dodajte `brainplaykids.com`
   - Dodajte `*.brainplaykids.com` (wildcard)

2. **Postavite Environment Variables:**

   - Idite na Project Settings → Environment Variables
   - Dodajte sve potrebne varijable (vidi gore)
   - Postavite za Production, Preview, i Development

3. **Redeploy aplikacije:**
   - Nakon postavljanja varijabli, redeploy-ujte aplikaciju

## Testiranje

Nakon deployment-a, testirajte:

1. **Main domain:**

   - `https://brainplaykids.com` - Landing page
   - `https://brainplaykids.com/admin/login` - Admin login
   - `https://brainplaykids.com/onboarding` - Onboarding flow

2. **Subdomain:**
   - `https://test-family.brainplaykids.com` - Test tenant
   - `https://test-family.brainplaykids.com/parent/login` - Parent login
   - `https://test-family.brainplaykids.com/child/[childId]/login` - Child login

## Troubleshooting

### Subdomain ne radi

- Proverite DNS konfiguraciju (wildcard record)
- Proverite da li je domen dodat u Vercel
- Proverite da li je `NEXT_PUBLIC_DOMAIN` postavljen na `brainplaykids.com`

### Redirecti ne rade

- Proverite da li su svi `window.location.href` pozivi koriste `buildSubdomainUrl()` helper
- Proverite browser konzolu za greške

### API pozivi ne rade

- Proverite da li `NEXT_PUBLIC_APP_URL` postoji (opciono, automatski se detektuje)
- Proverite CORS settings ako ima problema

## Seed Podaci za Production

**NE POKRENITE SEED SKRIPTU NA PRODUCTION!**

Umesto toga, kreirajte test naloge ručno kroz admin dashboard ili kroz API.

Ako morate da pokrenete seed, prvo proverite da li ste u development okruženju:

```bash
if [ "$NODE_ENV" != "production" ]; then
  npm run db:seed
fi
```
