# Wereldklasse Verbeterplan - Liefde Voor Iedereen

## Huidige Status Samenvatting

| Gebied | Score | Status |
|--------|-------|--------|
| **Beveiliging** | 4/10 | KRITIEK - Secrets exposed, CSRF ontbreekt |
| **Code Kwaliteit** | 5/10 | MATIG - TypeScript `any`, geen componenten |
| **Performance** | 4/10 | KRITIEK - N+1 queries, geen caching |
| **Testing** | 1/10 | KRITIEK - ~1% coverage |
| **Architectuur** | 6/10 | REDELIJK - Goede basis, matige structuur |
| **UX/Frontend** | 5/10 | MATIG - Monolithische pages, geen design system |
| **Documentatie** | 2/10 | SLECHT - Geen README, geen API docs |
| **DevOps** | 4/10 | MATIG - Basic CI, geen monitoring |

---

## FASE 1: KRITIEKE BEVEILIGINGSFIXES (Week 1)

### 1.1 Geheimen Rotatie (ONMIDDELLIJK)
```bash
# ALLE keys zijn gecompromitteerd in .env - ROTEER NU:
- NEXTAUTH_SECRET
- UPLOADTHING_SECRET & TOKEN
- DATABASE_URL credentials
- OPENROUTER_API_KEY
```

**Acties:**
- [ ] Verwijder `.env` uit git history met BFG Repo-Cleaner
- [ ] Genereer nieuwe secrets voor alle services
- [ ] Gebruik environment variables via Vercel/hosting platform
- [ ] Voeg `.env` toe aan `.gitignore`

### 1.2 Console.log Wachtwoord Reset Verwijderen
**Bestand:** `app/api/auth/forgot-password/route.ts:80`
```typescript
// VERWIJDER DEZE REGEL:
console.log(`[DEV] Password reset link for ${normalizedEmail}: ${resetUrl}`)
```

### 1.3 CSRF Bescherming Toevoegen
**Nieuwe file:** `lib/csrf.ts`
```typescript
import { headers } from 'next/headers'
import { getServerSession } from 'next-auth'

export async function validateCSRF(request: Request) {
  const session = await getServerSession()
  const origin = headers().get('origin')
  const host = headers().get('host')

  if (!session) return false
  if (!origin || !host) return false

  const originUrl = new URL(origin)
  return originUrl.host === host
}
```

### 1.4 Content Security Policy Verbeteren
**Bestand:** `next.config.mjs`
```javascript
// Vervang 'unsafe-inline' en 'unsafe-eval':
`script-src 'self' 'nonce-${nonce}';`
`style-src 'self' 'nonce-${nonce}';`
```

### 1.5 Redis Rate Limiting voor Productie
**Bestand:** `lib/rate-limit.ts` - Activeer Redis adapter
```typescript
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})
```

---

## FASE 2: DATABASE & PERFORMANCE (Week 2)

### 2.1 Ontbrekende Database Indexes
**Bestand:** `prisma/schema.prisma`
```prisma
model User {
  email String @unique  // Voeg @unique toe als niet aanwezig
  // Voeg composite index toe:
  @@index([gender, birthDate, city])
}

model Message {
  @@index([senderId])
}

model Report {
  @@index([reporterId])
  @@index([reportedId])
}

model Subscription {
  @@index([userId])
}
```

### 2.2 N+1 Query Fixes
**Bestand:** `app/api/discover/route.ts`
```typescript
// VOOR: 3 aparte queries + memory filtering
// NA: Single optimized query met subqueries

const excludedIds = await prisma.$queryRaw`
  SELECT id FROM "User" WHERE id IN (
    SELECT "swipedId" FROM "Swipe" WHERE "swiperId" = ${userId}
    UNION
    SELECT "user1Id" FROM "Match" WHERE "user2Id" = ${userId}
    UNION
    SELECT "user2Id" FROM "Match" WHERE "user1Id" = ${userId}
    UNION
    SELECT "blockedId" FROM "Block" WHERE "blockerId" = ${userId}
    UNION
    SELECT "blockerId" FROM "Block" WHERE "blockedId" = ${userId}
  )
`;
```

### 2.3 Caching Strategie Implementeren
**Nieuwe file:** `lib/cache.ts`
```typescript
import { unstable_cache } from 'next/cache'

export const getCachedProfile = unstable_cache(
  async (userId: string) => {
    return prisma.user.findUnique({ where: { id: userId } })
  },
  ['user-profile'],
  { revalidate: 300, tags: ['user'] }
)

export const getCachedBlogPosts = unstable_cache(
  async () => {
    return prisma.post.findMany({ where: { published: true } })
  },
  ['blog-posts'],
  { revalidate: 3600 }
)
```

### 2.4 API Response Compressie
**Bestand:** `next.config.mjs`
```javascript
const nextConfig = {
  compress: true,
  swcMinify: true,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
}
```

---

## FASE 3: CODE ARCHITECTUUR (Week 3-4)

### 3.1 Component Library Creëren
```
components/
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Avatar.tsx
│   └── Badge.tsx
├── forms/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── ProfileForm.tsx
│   └── ReportForm.tsx
├── features/
│   ├── discover/
│   │   ├── DiscoverCard.tsx
│   │   ├── FilterPanel.tsx
│   │   └── SwipeActions.tsx
│   ├── matches/
│   │   ├── MatchList.tsx
│   │   └── MatchCard.tsx
│   ├── chat/
│   │   ├── MessageList.tsx
│   │   ├── MessageInput.tsx
│   │   └── ChatHeader.tsx
│   └── notifications/
│       ├── NotificationList.tsx
│       └── NotificationItem.tsx
└── layout/
    ├── Header.tsx
    ├── Footer.tsx
    ├── Sidebar.tsx
    └── MobileNav.tsx
```

### 3.2 Type Definities Verbeteren
**Nieuwe file:** `lib/types/api.ts`
```typescript
// Gestandaardiseerde API responses
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
  pagination?: Pagination
}

export interface ApiError {
  code: string
  message: string
  field?: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

// User types
export interface UserProfile {
  id: string
  name: string
  email: string
  profileImage: string | null
  bio: string | null
  birthDate: Date
  gender: Gender
  city: string | null
  photos: Photo[]
}

export interface DiscoverUser extends UserProfile {
  distance?: number
  compatibility?: number
}
```

### 3.3 Custom Hooks Extracten
**Nieuwe file:** `hooks/useCurrentUser.ts`
```typescript
import useSWR from 'swr'

export function useCurrentUser() {
  const { data, error, mutate } = useSWR('/api/profile', fetcher)

  return {
    user: data?.data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}
```

### 3.4 API Helper Functions
**Nieuwe file:** `lib/api-helpers.ts`
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { prisma } from './prisma'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null

  return prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true, email: true, name: true }
  })
}

export async function getBlockedUserIds(userId: string) {
  const blocks = await prisma.block.findMany({
    where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
    select: { blockerId: true, blockedId: true }
  })

  return blocks.flatMap(b => [b.blockerId, b.blockedId]).filter(id => id !== userId)
}

export function successResponse<T>(data: T, pagination?: Pagination) {
  return NextResponse.json({ success: true, data, pagination })
}

export function errorResponse(code: string, message: string, status = 400) {
  return NextResponse.json({ success: false, error: { code, message } }, { status })
}
```

---

## FASE 4: TESTING (Week 5-6)

### 4.1 Test Infrastructuur
```bash
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D msw                    # API mocking
npm install -D @faker-js/faker        # Test data
npm install -D playwright             # E2E tests
```

### 4.2 API Route Tests
**Nieuwe file:** `tests/api/auth.test.ts`
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createMocks } from 'node-mocks-http'
import { POST } from '@/app/api/register/route'

describe('POST /api/register', () => {
  it('should register a new user with valid data', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'SecurePass123',
        name: 'Test User',
        birthDate: '1990-01-01',
        gender: 'male',
      },
    })

    const response = await POST(req)
    expect(response.status).toBe(201)
  })

  it('should reject weak passwords', async () => {
    // ...
  })

  it('should reject duplicate emails', async () => {
    // ...
  })
})
```

### 4.3 Component Tests
**Nieuwe file:** `tests/components/LoginForm.test.tsx`
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginForm } from '@/components/forms/LoginForm'

describe('LoginForm', () => {
  it('validates email format', async () => {
    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email')
    fireEvent.change(emailInput, { target: { value: 'invalid' } })
    fireEvent.blur(emailInput)

    await waitFor(() => {
      expect(screen.getByText('Ongeldig email adres')).toBeInTheDocument()
    })
  })
})
```

### 4.4 E2E Tests met Playwright
**Nieuwe file:** `e2e/user-journey.spec.ts`
```typescript
import { test, expect } from '@playwright/test'

test('complete user registration and discovery flow', async ({ page }) => {
  // Register
  await page.goto('/register')
  await page.fill('[name="email"]', 'newuser@test.com')
  await page.fill('[name="password"]', 'SecurePass123')
  await page.click('button[type="submit"]')

  // Verify redirect to discover
  await expect(page).toHaveURL('/discover')

  // Perform swipe
  await page.click('[data-testid="like-button"]')

  // Check match notification
  await expect(page.locator('[data-testid="match-modal"]')).toBeVisible()
})
```

### 4.5 Coverage Doelen
```
| Categorie | Huidig | Doel |
|-----------|--------|------|
| Unit Tests | 1% | 80% |
| Integration | 0% | 60% |
| E2E | 0% | 40% |
| Overall | 1% | 70% |
```

---

## FASE 5: REAL-TIME FEATURES (Week 7)

### 5.1 WebSocket Implementatie
**Installatie:**
```bash
npm install socket.io socket.io-client
npm install @upstash/redis  # Voor Pub/Sub
```

### 5.2 Socket Server
**Nieuwe file:** `lib/socket.ts`
```typescript
import { Server } from 'socket.io'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export function initSocket(server: any) {
  const io = new Server(server, {
    cors: { origin: process.env.NEXTAUTH_URL }
  })

  io.on('connection', (socket) => {
    const userId = socket.handshake.auth.userId

    // Join user's room
    socket.join(`user:${userId}`)

    // Handle real-time messages
    socket.on('message', async (data) => {
      await redis.publish('messages', JSON.stringify(data))
      io.to(`user:${data.recipientId}`).emit('new-message', data)
    })

    // Handle typing indicators
    socket.on('typing', (data) => {
      io.to(`user:${data.recipientId}`).emit('user-typing', data)
    })
  })

  return io
}
```

### 5.3 Real-Time Notificaties
```typescript
// Bij nieuwe match creatie:
io.to(`user:${matchedUserId}`).emit('new-match', {
  type: 'new_match',
  matchId: match.id,
  user: matchedUser
})

// Bij nieuw bericht:
io.to(`user:${recipientId}`).emit('new-message', {
  matchId,
  message: newMessage
})
```

---

## FASE 6: FRONTEND EXCELLENCE (Week 8-9)

### 6.1 Design System met Tailwind
**Nieuwe file:** `tailwind.config.js` (uitgebreid)
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          500: '#E91E63',  // Hoofdkleur
          600: '#db2777',
          700: '#be185d',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      animation: {
        'swipe-left': 'swipeLeft 0.3s ease-out',
        'swipe-right': 'swipeRight 0.3s ease-out',
        'match-pop': 'matchPop 0.5s ease-out',
      },
    },
  },
}
```

### 6.2 Lazy Loading Componenten
**Bestand:** `app/discover/page.tsx`
```typescript
import dynamic from 'next/dynamic'

const FilterPanel = dynamic(() => import('@/components/features/discover/FilterPanel'), {
  loading: () => <FilterSkeleton />,
  ssr: false
})

const ReportModal = dynamic(() => import('@/components/features/discover/ReportModal'), {
  ssr: false
})
```

### 6.3 Image Optimalisatie
```typescript
import Image from 'next/image'

// Vervang alle <img> met Next.js Image:
<Image
  src={photo.url}
  alt={user.name}
  width={400}
  height={500}
  className="object-cover"
  placeholder="blur"
  blurDataURL={photo.blurHash}
  priority={isFirstCard}
/>
```

### 6.4 Skeleton Loading States
```typescript
function DiscoverSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-2xl h-[500px] w-full" />
      <div className="mt-4 space-y-2">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  )
}
```

---

## FASE 7: MONITORING & OBSERVABILITY (Week 10)

### 7.1 Error Tracking
```bash
npm install @sentry/nextjs
```

**Configuratie:**
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
})
```

### 7.2 Performance Monitoring
```typescript
// lib/metrics.ts
import { metrics } from '@opentelemetry/api'

const meter = metrics.getMeter('dating-app')

export const apiLatency = meter.createHistogram('api_latency', {
  description: 'API endpoint latency',
  unit: 'ms',
})

export const activeUsers = meter.createUpDownCounter('active_users', {
  description: 'Number of active users',
})
```

### 7.3 Health Check Endpoint
**Nieuwe file:** `app/api/health/route.ts`
```typescript
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
    })
  } catch (error) {
    return NextResponse.json({ status: 'unhealthy' }, { status: 503 })
  }
}
```

### 7.4 Logging Verbeteren
```bash
npm install pino pino-pretty
```

```typescript
// lib/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined,
})

// Gebruik:
logger.info({ userId, action: 'login' }, 'User logged in')
logger.error({ error, endpoint }, 'API error occurred')
```

---

## FASE 8: DEVOPS & DEPLOYMENT (Week 11-12)

### 8.1 GitHub Actions CI/CD
**Nieuwe file:** `.github/workflows/ci.yml`
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:coverage
      - run: npm run build

      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high
      - uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  deploy:
    needs: [test, security]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### 8.2 Environment Configuratie
```
Vercel Environment Variables:
├── NEXTAUTH_SECRET (encrypted)
├── DATABASE_URL (encrypted)
├── UPLOADTHING_SECRET (encrypted)
├── REDIS_URL (encrypted)
├── SENTRY_DSN
└── NODE_ENV=production
```

### 8.3 Database Migrations
```yaml
# .github/workflows/db-migrate.yml
name: Database Migration

on:
  push:
    paths:
      - 'prisma/schema.prisma'
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

## FASE 9: ADVANCED FEATURES (Week 13+)

### 9.1 AI-Powered Matching
```typescript
// lib/matching-algorithm.ts
export async function calculateCompatibility(user1: User, user2: User) {
  let score = 0

  // Interest overlap
  const interests1 = new Set(user1.interests)
  const interests2 = new Set(user2.interests)
  const overlap = [...interests1].filter(i => interests2.has(i))
  score += overlap.length * 10

  // Location proximity
  const distance = calculateDistance(user1, user2)
  if (distance < 10) score += 30
  else if (distance < 25) score += 20
  else if (distance < 50) score += 10

  // Activity level
  if (Math.abs(user1.activityScore - user2.activityScore) < 20) {
    score += 15
  }

  return Math.min(100, score)
}
```

### 9.2 Video Chat Integratie
```bash
npm install @twilio/video
```

### 9.3 Advanced Safety Features
- Photo verification met AI
- Geautomatiseerde content moderatie
- Fraud detectie algoritmes
- Two-Factor Authentication

### 9.4 Analytics Dashboard
- User acquisition funnel
- Match success rate
- Message response times
- Subscription conversions

---

## PRIORITEITEN MATRIX

| Prioriteit | Items | Impact | Effort |
|------------|-------|--------|--------|
| **P0 - NU** | Secrets rotatie, password log verwijderen | KRITIEK | Laag |
| **P1 - Week 1** | CSRF, Rate limiting, CSP fix | Hoog | Medium |
| **P2 - Week 2-3** | Database indexes, N+1 fixes, caching | Hoog | Medium |
| **P3 - Week 4-5** | Component library, type safety | Medium | Hoog |
| **P4 - Week 6-7** | Testing (80% coverage) | Hoog | Hoog |
| **P5 - Week 8-9** | Real-time WebSockets, UX improvements | Medium | Medium |
| **P6 - Week 10+** | Monitoring, CI/CD, advanced features | Medium | Medium |

---

## SUCCESS METRICS

| Metric | Huidig | Doel |
|--------|--------|------|
| Security Score (OWASP) | D | A |
| Lighthouse Performance | ~50 | 90+ |
| Test Coverage | 1% | 80% |
| API Response Time (p95) | ~500ms | <100ms |
| Time to First Match | Unknown | <5 min |
| Uptime | Unknown | 99.9% |
| Error Rate | Unknown | <0.1% |

---

## VOLGENDE STAPPEN

1. **VANDAAG:** Roteer alle gecompromitteerde secrets
2. **DEZE WEEK:** Implementeer kritieke beveiligingsfixes (Fase 1)
3. **VOLGENDE WEEK:** Begin met database optimalisaties (Fase 2)
4. **ELKE WEEK:** Code review + security scanning in CI/CD

Wil je dat ik begin met een specifieke fase of heb je vragen over het plan?
