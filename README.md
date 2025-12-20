# Liefde Voor Iedereen 💖

Een moderne, veilige en performante dating platform gebouwd met Next.js 14, TypeScript, en Prisma.

[![CI/CD Pipeline](https://github.com/your-org/liefde-voor-iedereen/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/liefde-voor-iedereen/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## ✨ Features

### 🎯 Core Features
- **Smart Matching**: Geavanceerd matching algoritme op basis van voorkeuren, locatie, en interesses
- **Real-time Chat**: Instant messaging met typing indicators en read receipts
- **Swipe Interface**: Intuïtieve swipe interface met smooth animations
- **Photo Management**: Multi-photo profiles met optimized image loading
- **Location-based**: Vind matches in jouw buurt met geoptimaliseerde geo-queries
- **Voice Messages**: Optionele voice intro voor authentieke connecties

### 🔒 Security & Safety
- **CSRF Protection**: Volledige CSRF bescherming op alle state-changing endpoints
- **Rate Limiting**: Redis-backed rate limiting om misbruik te voorkomen
- **Content Security Policy**: Strict CSP headers voor XSS bescherming
- **Report System**: Gebruikers kunnen ongepast gedrag rapporteren
- **Block Feature**: Directe blocking functionaliteit
- **Safety Score**: Automatische safety score tracking per gebruiker
- **AVG Compliance**: Cookie consent systeem met privacy controls
- **Google OAuth**: Veilige social login met Google

### 🚀 Performance
- **Server-side Rendering**: Optimale SEO en initial load performance
- **Image Optimization**: Next.js Image component met blur placeholders
- **Database Indexes**: Geoptimaliseerde composite indexes voor snelle queries
- **Caching Strategy**: Next.js cache met revalidation tags
- **Code Splitting**: Automatische code splitting en lazy loading
- **Redis Caching**: Optionele Redis cache voor production

### 📱 User Experience
- **Responsive Design**: Mobile-first design dat werkt op alle devices
- **Dark Mode Ready**: Theme system voorbereid voor dark mode
- **Progressive Web App**: PWA support voor app-like ervaring
- **Accessibility**: ARIA labels en keyboard navigation
- **Loading States**: Skeleton loaders voor betere perceived performance
- **Error Handling**: Gebruiksvriendelijke error messages en recovery
- **Analytics**: Google Analytics integratie met consent-based tracking

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** - React framework met App Router
- **TypeScript** - Type safety door de hele applicatie
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animations en transitions
- **SWR** - Data fetching en caching

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - Type-safe ORM
- **PostgreSQL** - Primaire database (Neon.tech)
- **NextAuth.js** - Authenticatie
- **UploadThing** - File uploads

### Infrastructure
- **Vercel** - Hosting en deployment
- **GitHub Actions** - CI/CD pipeline
- **Sentry** - Error tracking en monitoring
- **Upstash Redis** - Rate limiting en caching

---

## 📂 Project Structure

```
liefde-voor-iedereen/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── discover/       # Discovery feed
│   │   ├── swipe/          # Swipe actions
│   │   ├── matches/        # Match management
│   │   └── messages/       # Messaging
│   ├── (auth)/             # Auth pages (login, register)
│   ├── discover/           # Discover feed page
│   ├── matches/            # Matches list page
│   └── chat/               # Chat interface
│
├── components/              # React components
│   ├── ui/                 # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   ├── forms/              # Form components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ProfileForm.tsx
│   ├── features/           # Feature-specific components
│   │   ├── discover/
│   │   ├── matches/
│   │   └── chat/
│   └── layout/             # Layout components
│
├── lib/                     # Utility libraries
│   ├── prisma.ts           # Prisma client
│   ├── auth.ts             # NextAuth configuration
│   ├── api-helpers.ts      # API utilities
│   ├── cache.ts            # Caching utilities
│   ├── rate-limit.ts       # Rate limiting
│   ├── csrf.ts             # CSRF protection
│   └── types/              # TypeScript types
│
├── hooks/                   # Custom React hooks
│   ├── useCurrentUser.ts
│   ├── useMatches.ts
│   ├── useDiscoverUsers.ts
│   ├── useDebounce.ts
│   └── ...
│
├── prisma/                  # Database schema
│   ├── schema.prisma
│   └── migrations/
│
├── tests/                   # Test files
│   ├── api/                # API route tests
│   ├── unit/               # Unit tests
│   └── e2e/                # End-to-end tests
│
├── docs/                    # Documentation
│   ├── ARCHITECTURE.md
│   ├── SECURITY.md
│   ├── TESTING.md
│   └── PRODUCTION_CHECKLIST.md
│
└── public/                  # Static files
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database (or Neon.tech account)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/liefde-voor-iedereen.git
cd liefde-voor-iedereen
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Authentication
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Social Login)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-google-client-secret"

# File Uploads
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_TOKEN="your-uploadthing-token"

# Optional: Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"

# Optional: Redis (for production)
REDIS_URL="redis://localhost:6379"

# Optional: Sentry (for error tracking)
NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn"
```

**Google OAuth Setup:**
Zie [docs/GOOGLE_OAUTH_SETUP.md](docs/GOOGLE_OAUTH_SETUP.md) voor complete setup instructies.

Quick start:
1. Ga naar [Google Cloud Console](https://console.cloud.google.com/)
2. Maak een nieuw project
3. Configureer OAuth consent screen
4. Maak OAuth 2.0 credentials
5. Voeg credentials toe aan `.env`

4. **Setup database**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

5. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

### Run all tests
```bash
npm run test
```

### Run specific test suites
```bash
# Unit tests
npm run test:unit

# API tests
npm run test:api

# Security tests
npm run test:security

# E2E tests
npm run test:e2e

# With coverage
npm run test:coverage
```

### Test Coverage Goals
- Unit Tests: 80%+
- Integration Tests: 60%+
- E2E Tests: 40%+
- Overall: 70%+

---

## 📦 Building for Production

### Build the application
```bash
npm run build
```

### Preview production build
```bash
npm start
```

### Production Checklist
Zie [docs/PRODUCTION_CHECKLIST.md](docs/PRODUCTION_CHECKLIST.md) voor complete deployment checklist.

**Essentieel:**
- ✅ Alle environment variables zijn ingesteld
- ✅ Database migraties zijn uitgevoerd
- ✅ NEXTAUTH_SECRET is geroteerd
- ✅ Redis is geconfigureerd voor rate limiting
- ✅ Sentry is ingesteld voor error tracking
- ✅ CSP headers zijn geconfigureerd
- ✅ SSL certificaat is actief

---

## 🔧 Development

### Code Style
We gebruiken ESLint en Prettier voor code consistency:
```bash
# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format
```

### Type Checking
```bash
# Type check
npx tsc --noEmit
```

### Database Management
```bash
# View database in Prisma Studio
npx prisma studio

# Create migration
npx prisma migrate dev --name your_migration_name

# Reset database (caution!)
npx prisma migrate reset
```

---

## 📚 Documentation

- [Architecture](docs/ARCHITECTURE.md) - Systeem architectuur en design decisions
- [Security](docs/SECURITY.md) - Security best practices en implementatie
- [Testing](docs/TESTING.md) - Testing strategie en guidelines
- [Refactoring Guide](docs/REFACTORING_GUIDE.md) - Code refactoring resultaten
- [Production Checklist](docs/PRODUCTION_CHECKLIST.md) - Deployment checklist
- [Google OAuth Setup](docs/GOOGLE_OAUTH_SETUP.md) - Google login configuratie

---

## 🎯 Roadmap

### Phase 1: Foundation ✅
- [x] Core matching systeem
- [x] Authentication & authorization
- [x] Basic messaging
- [x] Security fundamenten

### Phase 2: Enhancement ✅
- [x] Component library
- [x] Type safety
- [x] Testing infrastructure
- [x] Performance optimalisaties

### Phase 3: Advanced Features 🚧
- [ ] Real-time WebSocket messaging
- [ ] Video chat integratie
- [ ] AI-powered matching
- [ ] Advanced analytics
- [ ] Premium subscriptions

### Phase 4: Scale 📋
- [ ] Multi-region deployment
- [ ] Advanced caching strategy
- [ ] CDN integratie
- [ ] Performance monitoring dashboard

---

## 🤝 Contributing

We verwelkomen contributions! Zie [CONTRIBUTING.md](CONTRIBUTING.md) voor guidelines.

### Development Workflow
1. Fork de repository
2. Maak een feature branch (`git checkout -b feature/amazing-feature`)
3. Commit je changes (`git commit -m 'Add amazing feature'`)
4. Push naar de branch (`git push origin feature/amazing-feature`)
5. Open een Pull Request

### Code Review Process
- Alle PRs moeten door CI/CD pipeline
- Minimaal 1 approval vereist
- Code coverage mag niet dalen
- Volg de code style guidelines

---

## 📄 License

Dit project is gelicenseerd onder de MIT License - zie [LICENSE](LICENSE) voor details.

---

## 👥 Team

Gebouwd met ❤️ door het Liefde Voor Iedereen team.

---

## 🆘 Support

Heb je vragen of problemen?
- Open een [GitHub Issue](https://github.com/your-org/liefde-voor-iedereen/issues)
- Bekijk de [documentation](docs/)
- Contact: support@liefdevooried

erreen.nl

---

## 🙏 Acknowledgments

- Next.js team voor het geweldige framework
- Prisma voor de beste ORM
- Vercel voor hosting en deployment
- Alle open-source contributors

---

<div align="center">
  <strong>Gemaakt met 💖 in Nederland</strong>
</div>
