# Deployment Guide - Liefde Voor Iedereen

## Overzicht
Deze app is klaar voor productie deployment op Vercel. Volg deze stappen voor een professionele deployment.

## ✅ App is Production-Ready

### Huidige Features:
- ✅ Next.js 14 App Router (Vercel's specialiteit)
- ✅ TypeScript voor type safety
- ✅ Prisma ORM met PostgreSQL
- ✅ NextAuth voor authenticatie
- ✅ Sentry voor error tracking
- ✅ UploadThing voor file uploads
- ✅ Optimized images met Next.js Image
- ✅ Security headers geconfigureerd
- ✅ CSP (Content Security Policy) headers
- ✅ Responsive design (mobile + desktop)
- ✅ World-class navigation

---

## 🚀 Deployment Stappen

### 1. Database Setup (Productie)

**Optie A: Vercel Postgres (Aanbevolen)**
```bash
# In je Vercel dashboard:
# Storage → Create Database → Postgres
# Kopieer de DATABASE_URL
```

**Optie B: Supabase (Gratis tier)**
```bash
# 1. Ga naar https://supabase.com
# 2. Maak een nieuw project
# 3. Kopieer de Connection String (Session Pooler)
```

**Optie C: Neon (Gratis tier)**
```bash
# 1. Ga naar https://neon.tech
# 2. Maak een nieuw project
# 3. Kopieer de Connection String
```

### 2. Push Code naar GitHub

```bash
# Initialiseer Git (als nog niet gedaan)
git init
git add .
git commit -m "Initial commit - Liefde Voor Iedereen"

# Maak een GitHub repository
# Ga naar https://github.com/new
# Kopieer de repository URL

# Push naar GitHub
git remote add origin https://github.com/jouw-username/liefde-voor-iedereen.git
git branch -M main
git push -u origin main
```

### 3. Deploy naar Vercel

#### Via Vercel Dashboard:
1. Ga naar https://vercel.com
2. Klik "New Project"
3. Import je GitHub repository
4. Vercel detecteert automatisch Next.js

#### Via Vercel CLI:
```bash
npm i -g vercel
vercel login
vercel
```

### 4. Environment Variables in Vercel

Ga naar je Vercel project → Settings → Environment Variables:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# NextAuth
NEXTAUTH_URL=https://jouw-app.vercel.app
NEXTAUTH_SECRET=genereer_een_nieuwe_random_string_hier

# UploadThing
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=app_...

# Sentry (Optioneel)
SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=...

# OpenRouter AI (Voor AI features)
OPENROUTER_API_KEY=sk-or-v1-...
```

**Genereer NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
# Of in Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 5. Database Migratie naar Productie

```bash
# Deploy database schema naar productie
DATABASE_URL="je-productie-database-url" npx prisma db push

# Of met migraties (aanbevolen):
DATABASE_URL="je-productie-database-url" npx prisma migrate deploy

# Seed de database (optioneel)
DATABASE_URL="je-productie-database-url" npx prisma db seed
```

### 6. Migreer je Gebruikers (Optioneel)

Als je de oude database wilt migreren:
```bash
# Zet eerst de oude database SQL file ergens online
# Update het script om de productie DATABASE_URL te gebruiken
DATABASE_URL="je-productie-database-url" npx tsx scripts/migrate-users.ts
```

---

## 🔧 Pre-Deployment Checklist

### Code Quality
- [ ] Verwijder alle `console.log()` statements
- [ ] Verwijder development-only code
- [ ] Test alle features lokaal
- [ ] Run `npm run build` succesvol
- [ ] Fix alle TypeScript errors

### Security
- [ ] Genereer een nieuwe NEXTAUTH_SECRET
- [ ] Update NEXTAUTH_URL naar productie domein
- [ ] Controleer dat geen secrets in code staan
- [ ] Test CSP headers
- [ ] Controleer CORS settings

### Performance
- [ ] Optimaliseer images
- [ ] Test loading speed
- [ ] Check bundle size: `npm run build`
- [ ] Enable compression (al geconfigureerd)

### Database
- [ ] Backup maken van oude database
- [ ] Test database connectie
- [ ] Run migrations
- [ ] Seed initial data (indien nodig)

---

## 🛠️ Build Commands (voor Vercel)

Vercel gebruikt deze automatisch, maar je kunt ze aanpassen:

```json
{
  "buildCommand": "npx prisma generate && next build",
  "devCommand": "next dev",
  "installCommand": "npm install"
}
```

In je `package.json`:
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "start": "next start",
    "postinstall": "prisma generate"
  }
}
```

---

## 🌐 Custom Domain (Optioneel)

1. Ga naar Vercel → Settings → Domains
2. Voeg je domain toe (bijv. `liefdevooriedereen.nl`)
3. Update DNS records bij je registrar:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Update `NEXTAUTH_URL` in environment variables

---

## 📊 Monitoring & Error Tracking

### Sentry
Je app heeft al Sentry geconfigureerd:
- Errors worden automatisch gerapporteerd
- Performance monitoring ingeschakeld
- Source maps worden ge-upload (alleen in productie)

### Vercel Analytics
```bash
npm install @vercel/analytics
```

Voeg toe aan `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

---

## 🔒 Security Best Practices

### 1. Rate Limiting
Overweeg rate limiting toe te voegen voor API routes:
```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
})
```

### 2. HTTPS Only
- Vercel forceert HTTPS automatisch
- Check `upgrade-insecure-requests` in CSP (al geconfigureerd)

### 3. Regular Updates
```bash
# Check for security vulnerabilities
npm audit

# Update dependencies
npm update
```

---

## 💰 Kosten Indicatie

### Gratis Tier (Perfect om mee te starten):
- **Vercel**: Gratis voor hobby projecten
  - 100GB bandwidth
  - 100 builds per maand
  - Serverless functions

- **Database Opties**:
  - Vercel Postgres: $0.10/maand voor 512MB
  - Supabase: Gratis tot 500MB + 2GB bandwidth
  - Neon: Gratis tot 3GB storage

- **UploadThing**: Gratis tot 2GB storage

**Totaal: €0-5/maand om te starten**

### Pro Setup (Bij groei):
- Vercel Pro: $20/maand
- Database: $15-50/maand (afhankelijk van gebruik)
- UploadThing Pro: $15/maand

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Test build lokaal
npm run build

# Check logs in Vercel dashboard
# Settings → Logs
```

### Database Connection Issues
```bash
# Test connection lokaal
DATABASE_URL="je-productie-url" npx prisma db pull

# Check IP whitelist (sommige providers)
```

### Environment Variables niet geladen
- Redeploy nodig na toevoegen/wijzigen vars
- Check spelling (hoofdlettergevoelig)
- Restart development server

### Images laden niet
- Check next.config.mjs remotePatterns
- Verify CSP headers allow image domain
- Check UploadThing API key

---

## 📝 Na Deployment

### 1. Test alle features:
- [ ] Registratie werkt
- [ ] Login werkt
- [ ] Profiel bewerken werkt
- [ ] Foto upload werkt
- [ ] Discover pagina laadt gebruikers
- [ ] Swipen werkt
- [ ] Matches werken
- [ ] Chat werkt
- [ ] Notificaties werken

### 2. Monitor errors in Sentry

### 3. Check performance in Vercel Analytics

### 4. Setup backups voor database

---

## 🎉 Je app is nu LIVE!

**Professionele features die je app al heeft:**
- ✅ Schaalbare architectuur
- ✅ Security best practices
- ✅ Error tracking
- ✅ Responsive design
- ✅ Optimized performance
- ✅ SEO-ready (metadata)
- ✅ Type-safe (TypeScript)
- ✅ Modern tech stack

**Volgende stappen:**
1. Test grondig in productie
2. Verzamel feedback van eerste gebruikers
3. Monitor performance en errors
4. Itereer en verbeter!

---

## 🆘 Hulp nodig?

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
- NextAuth Docs: https://next-auth.js.org

**Success met je deployment! 🚀**
