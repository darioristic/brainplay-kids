# MVP Analiza - BrainPlay Kids

## 📊 Šta je Urađeno

### ✅ Infrastruktura (100%)
- [x] Next.js 15 sa App Router
- [x] TypeScript konfiguracija
- [x] Tailwind CSS lokalno
- [x] Docker Compose (PostgreSQL + Redis)
- [x] Prisma schema sa svim modelima
- [x] Environment setup

### ✅ Backend API (95%)
- [x] **Auth APIs** - register, login, child-login, refresh
- [x] **Tenant APIs** - CRUD (admin)
- [x] **Family APIs** - get, update, stats
- [x] **Children APIs** - CRUD, settings update
- [x] **Game APIs** - modules, sessions, answer, complete, progress
- [ ] **Game question generation** - trenutno koristi mock data

### ✅ Multi-Tenant System (100%)
- [x] Subdomain middleware
- [x] Tenant detection i routing
- [x] Redis caching za tenant data
- [x] Tenant isolation u API routes

### ✅ Frontend Routes (80%)
- [x] Main domain: Landing page, Onboarding, Admin
- [x] Tenant subdomain: Family portal, Parent dashboard
- [x] Child dashboard (osnovna implementacija)
- [ ] Game session page (nedostaje `/game/[gameId]/page.tsx`)
- [ ] Image generator page (nedostaje implementacija)

### ✅ State Management (100%)
- [x] Zustand stores (auth, family, game)
- [x] API client sa JWT interceptors
- [x] Token refresh logic

### ✅ Komponente (70%)
- [x] LandingPage
- [x] OnboardingFlow
- [x] ParentDashboard
- [x] ChildDashboard (osnovna verzija)
- [x] SmartGame (postojeća komponenta)
- [x] OwlAssistant (postojeća komponenta)
- [x] ImageGenerator (postojeća komponenta)
- [ ] Child settings modal (nedostaje)
- [ ] Game session page (nedostaje)

### ⚠️ Nedostaje za MVP

## 🚨 Kritično za MVP (Mora se uraditi)

### 1. Game Session Flow (PRIORITET: VISOK)
**Problem:** Game session se renderuje u child dashboard-u, ali nedostaje dedikovana stranica.

**Šta treba:**
- [ ] Kreirati `app/[subdomain]/child/[childId]/game/[gameId]/page.tsx`
- [ ] Integrisati sa game session API-jem
- [ ] Implementirati flow: start session → play → submit answer → complete → award points
- [ ] Redirect back to dashboard nakon završetka

**Fajl:** `app/[subdomain]/child/[childId]/game/[gameId]/page.tsx`

### 2. Game Question Generation (PRIORITET: VISOK)
**Problem:** Trenutno se koristi mock question ("What is 7 + 6?").

**Šta treba:**
- [ ] API endpoint za generisanje pitanja na osnovu game module-a
- [ ] Integracija sa Gemini AI za dinamičko generisanje pitanja
- [ ] Age-appropriate question generation
- [ ] Difficulty-based question complexity

**Fajlovi:**
- `app/api/games/generate-question/route.ts` (novi)
- Update `app/api/games/sessions/route.ts` da koristi generated question

### 3. Child Settings Modal (PRIORITET: SREDNJI)
**Problem:** Child settings modal postoji u starom App.tsx, ali nije integrisan u Next.js.

**Šta treba:**
- [ ] Migrirati child settings modal u Next.js komponentu
- [ ] Integrisati sa `/api/children/[id]/settings` endpoint-om
- [ ] Avatar selection
- [ ] Theme preference
- [ ] Difficulty preference
- [ ] Buddy selection

**Fajl:** `components/ChildSettingsModal.tsx` (novi)

### 4. Onboarding Flow Integration (PRIORITET: SREDNJI)
**Problem:** OnboardingFlow komponenta postoji, ali nije potpuno integrisana sa API-jem.

**Šta treba:**
- [ ] Kompletna integracija sa `/api/auth/register`
- [ ] Kreiranje tenant-a tokom onboarding-a
- [ ] Kreiranje children tokom onboarding-a
- [ ] Redirect na tenant subdomain nakon završetka

**Fajl:** `app/(main)/onboarding/page.tsx` (update)

### 5. Image Generator Page (PRIORITET: NISKI)
**Problem:** ImageGenerator komponenta postoji, ali nema dedikovanu stranicu.

**Šta treba:**
- [ ] Kreirati `app/[subdomain]/child/[childId]/image-generator/page.tsx`
- [ ] Integrisati ImageGenerator komponentu
- [ ] Save generated images (opciono)

**Fajl:** `app/[subdomain]/child/[childId]/image-generator/page.tsx`

### 6. Database Seeding (PRIORITET: SREDNJI)
**Problem:** Baza je prazna - nema game modules.

**Šta treba:**
- [ ] Seed script sa initial game modules
- [ ] Test tenant i family data (opciono za development)

**Fajl:** `prisma/seed.ts`

### 7. Error Handling (PRIORITET: SREDNJI)
**Problem:** Nema centralizovanog error handling-a.

**Šta treba:**
- [ ] Error boundaries u Next.js
- [ ] User-friendly error messages
- [ ] API error handling u stores

**Fajlovi:**
- `components/ErrorBoundary.tsx` (već postoji, proveriti)
- Update stores sa error handling-om

### 8. Environment Configuration (PRIORITET: VISOK)
**Problem:** Prisma CLI ne čita `.env.local`, treba `.env` fajl.

**Šta treba:**
- [ ] Kreirati `.env` fajl sa DATABASE_URL (za Prisma CLI)
- [ ] Dokumentovati environment setup

## 📋 Srednji Prioritet (Može čekati)

### 9. Parent Dashboard Integration
- [ ] Integrisati sa `/api/families/[id]/stats`
- [ ] Real-time statistics
- [ ] Activity charts sa real data

### 10. Admin Interface
- [ ] Tenant creation form
- [ ] Tenant edit functionality
- [ ] Tenant statistics

### 11. Loading States
- [ ] LoadingSpinner komponenta (već postoji)
- [ ] Skeleton loaders za liste
- [ ] Optimistic updates

### 12. Form Validation
- [ ] Client-side validation sa Zod
- [ ] Error messages u formama
- [ ] Input sanitization

## 🔧 Tehnički Debri (Cleanup)

### 13. Stari Fajlovi
- [ ] Obrisati `App.tsx`, `index.tsx`, `index.html` (stari Vite setup)
- [ ] Obrisati `vite.config.ts`
- [ ] Obrisati `pages/` folder ako je prazan

### 14. Type Safety
- [ ] Proveriti sve TypeScript greške
- [ ] Dodati missing types
- [ ] Fix any `any` types

### 15. Testing Setup
- [ ] Basic smoke tests
- [ ] API endpoint tests (opciono)

## 🎯 MVP Checklist

### Minimalno za funkcionalan MVP:

1. ✅ **User može da se registruje** - DONE
2. ✅ **User može da kreira tenant/family** - DONE (kroz onboarding)
3. ✅ **User može da doda decu** - DONE (kroz onboarding)
4. ⚠️ **Child može da se uloguje sa PIN-om** - API DONE, frontend delimično
5. ⚠️ **Child može da vidi game modules** - DONE
6. ❌ **Child može da pokrene igru** - NEDOSTAJE game session page
7. ❌ **Child može da odgovori na pitanje** - NEDOSTAJE question generation
8. ❌ **Child dobija poene nakon tačnog odgovora** - API DONE, frontend nedostaje
9. ⚠️ **Child može da vidi svoj progress** - DONE (osnovno)
10. ⚠️ **Parent može da vidi statistike** - API DONE, frontend delimično

## 🚀 Preporučeni Redosled za MVP

### Sprint 1 (1-2 dana) - Kritično
1. Game question generation API
2. Game session page (`/game/[gameId]/page.tsx`)
3. Complete game flow (start → play → submit → complete)

### Sprint 2 (1 dan) - Važno
4. Onboarding flow integration
5. Database seeding (game modules)
6. Child settings modal

### Sprint 3 (1 dan) - Polish
7. Error handling
8. Loading states
9. Form validation
10. Cleanup starih fajlova

## 📝 Napomene

- **Baza podataka:** Migracija je urađena, ali koristi `postgres` korisnika umesto `brainplay`. Treba popraviti ili koristiti postgres za development.
- **Environment:** Prisma CLI traži `.env` fajl, ne `.env.local`
- **Subdomain routing:** Radi za localhost development
- **Authentication:** JWT flow je implementiran, ali treba testirati end-to-end

## 🎯 MVP Definition

**MVP je funkcionalan kada:**
1. Roditelj može da se registruje i kreira family space
2. Roditelj može da doda decu sa PIN-om
3. Dete može da se uloguje sa PIN-om
4. Dete može da vidi listu igara
5. Dete može da pokrene igru i odgovori na pitanje
6. Dete dobija poene za tačne odgovore
7. Roditelj može da vidi osnovne statistike

**Trenutno:** ~70% MVP-a je implementirano. Nedostaje game flow i question generation.

