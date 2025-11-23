# Test Accounts

Ovaj dokument sadrži informacije o test nalozima kreiranim seed skriptom.

## Pokretanje Seed Skripte

```bash
npm run db:seed
```

ili

```bash
npx prisma db seed
```

## Test Nalozi

### Admin Nalog
- **Email:** `admin@brainplaykids.com`
- **Password:** `admin123`
- **URL:** `/admin/login`
- **Opis:** Admin nalog za pristup admin dashboard-u gde možete upravljati svim tenantima i platformom.

### Roditeljski Nalog
- **Email:** `parent@test.com`
- **Password:** `parent123`
- **Subdomain:** `test-family.brainplaykids.com`
- **URL:** `http://test-family.localhost:3000/parent/login` (development)
- **Opis:** Test roditeljski nalog sa jednim detetom.

### Dete Nalog
- **Ime:** `Test Child`
- **PIN:** `1234`
- **URL:** `http://test-family.localhost:3000/child/test-child-1/login` (development)
- **Opis:** Test dete nalog za testiranje child dashboard-a.

## Korišćenje

1. **Admin Dashboard:**
   - Idite na `/admin/login`
   - Prijavite se sa admin nalogom
   - Upravljajte tenantima, porodicama i platformom

2. **Roditeljski Dashboard:**
   - Idite na `test-family.localhost:3000/parent/login` (ili production URL)
   - Prijavite se sa roditeljskim nalogom
   - Upravljajte porodicom i dečjim nalozima

3. **Child Dashboard:**
   - Idite na `test-family.localhost:3000/child/test-child-1/login`
   - Unesite PIN: `1234`
   - Igrajte igre i koristite aplikaciju

## Napomena

Ovi nalozi su kreirani samo za testiranje i development. U production okruženju, obavezno promenite lozinke i obezbedite odgovarajuću sigurnost.

