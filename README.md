# BrainPlay Kids - Next.js Multi-Tenant Application

A production-ready multi-tenant educational platform built with Next.js 15, featuring custom subdomains for each tenant.

## Features

- ✅ Custom subdomain routing with Next.js middleware
- ✅ Tenant-specific content and pages
- ✅ Shared components and layouts across tenants
- ✅ Redis for tenant data storage
- ✅ PostgreSQL for persistent data
- ✅ Admin interface for managing tenants
- ✅ JWT authentication for parents
- ✅ PIN-based authentication for children
- ✅ AI-powered game system with Gemini
- ✅ Voice assistant (Owl Assistant)

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Prisma ORM)
- **Cache**: Redis
- **State Management**: Zustand
- **AI**: Google Gemini API

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL and Redis (via Docker)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd brainplay-kids
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Start Docker services:
```bash
docker-compose up -d
```

5. Run database migrations:
```bash
npm run db:migrate
```

6. Start development server:
```bash
npm run dev
```

### Local Subdomain Setup

For local development with subdomains, add to `/etc/hosts`:
```
127.0.0.1 localhost
127.0.0.1 smith-family.localhost
127.0.0.1 test-family.localhost
```

Then access:
- Main domain: http://localhost:3000
- Tenant: http://smith-family.localhost:3000

## Project Structure

```
brainplay-kids/
├── app/                    # Next.js App Router
│   ├── (main)/            # Main domain routes
│   ├── [subdomain]/       # Tenant subdomain routes
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utilities and services
├── stores/                # Zustand stores
├── prisma/                # Database schema
└── types/                 # TypeScript types
```

## API Routes

### Authentication
- `POST /api/auth/register` - Register parent
- `POST /api/auth/login` - Parent login
- `POST /api/auth/child-login` - Child PIN login
- `POST /api/auth/refresh` - Refresh token

### Tenants (Admin)
- `GET /api/tenants` - List tenants
- `POST /api/tenants` - Create tenant
- `GET /api/tenants/[id]` - Get tenant
- `PUT /api/tenants/[id]` - Update tenant
- `DELETE /api/tenants/[id]` - Delete tenant

### Families
- `GET /api/families` - Get family
- `PUT /api/families/[id]` - Update family
- `GET /api/families/[id]/stats` - Family statistics

### Children
- `GET /api/children` - List children
- `POST /api/children` - Create child
- `GET /api/children/[id]` - Get child
- `PUT /api/children/[id]` - Update child
- `PUT /api/children/[id]/settings` - Update child settings
- `DELETE /api/children/[id]` - Delete child

### Games
- `GET /api/games/modules` - List game modules
- `POST /api/games/sessions` - Create game session
- `POST /api/games/sessions/[id]/answer` - Submit answer
- `POST /api/games/sessions/[id]/complete` - Complete session
- `GET /api/games/progress/[childId]` - Get child progress

## Development

```bash
# Run development server
npm run dev

# Run database migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

See `.env.example` for required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - JWT refresh secret
- `GEMINI_API_KEY` - Google Gemini API key
- `NEXT_PUBLIC_APP_URL` - Application URL
- `NEXT_PUBLIC_DOMAIN` - Main domain (e.g., brainplaykids.com)

## Deployment

Za detaljne instrukcije o deployment-u na Vercel, pogledajte [vercel-deploy.md](./vercel-deploy.md).

## Database Setup

Za brzu postavku DATABASE_URL na Vercel-u, pogledajte [SETUP_DATABASE.md](./SETUP_DATABASE.md).

### Quick Deploy to Vercel

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Deploy to production
vercel --prod
```

## License

MIT
