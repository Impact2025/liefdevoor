# Security Guide - Liefde Voor Iedereen

## Inhoudsopgave
1. [Overzicht](#overzicht)
2. [Secret Rotatie](#secret-rotatie)
3. [CSRF Bescherming](#csrf-bescherming)
4. [Rate Limiting](#rate-limiting)
5. [Deployment Security](#deployment-security)
6. [Monitoring & Incident Response](#monitoring--incident-response)
7. [Security Checklist](#security-checklist)

---

## Overzicht

Dit document beschrijft de beveiligingsmaatregelen die zijn geïmplementeerd in de Liefde Voor Iedereen dating applicatie en hoe deze te onderhouden.

### Geïmplementeerde Beveiligingslagen

- ✅ **CSRF Protection** - Voorkomt cross-site request forgery aanvallen
- ✅ **Rate Limiting** - Beschermt tegen brute force en DDoS
- ✅ **Content Security Policy** - Voorkomt XSS aanvallen
- ✅ **Secure Headers** - HSTS, X-Frame-Options, etc.
- ✅ **Input Validation** - Validatie op alle API endpoints
- ✅ **Audit Logging** - Tracking van security-kritieke acties

---

## Secret Rotatie

### Waarom Secret Rotatie Belangrijk Is

Secrets kunnen op verschillende manieren gecompromitteerd worden:
- Accidenteel gecommit naar version control
- Logbestanden waar secrets worden gelogd
- Insider threats of verlopen medewerkers
- Datalekken bij third-party services

**Best Practice:** Roteer alle productie secrets minimaal **elke 90 dagen**.

### Stap-voor-stap Rotatie Procedure

#### 1. NEXTAUTH_SECRET Rotatie

```bash
# 1. Genereer nieuwe secret
openssl rand -base64 32

# 2. Test de nieuwe secret eerst in staging
# Update .env in staging environment
NEXTAUTH_SECRET=nieuwe-secret-hier

# 3. Deploy naar staging en test thoroughly
# - Login/logout flows
# - Session persistence
# - Password reset flows

# 4. Schedule productie deployment (bij lage traffic)
# Update environment variable via Vercel/hosting dashboard

# 5. Monitor error logs na deployment
# Oude sessions zullen invalide worden - dit is normaal
```

**Belangrijk:** Gebruikers moeten opnieuw inloggen na NEXTAUTH_SECRET rotatie.

#### 2. Database Credentials Rotatie

```bash
# Voor Neon.tech:
# 1. Ga naar Neon dashboard
# 2. Create nieuwe database user
# 3. Grant dezelfde permissions
# 4. Update DATABASE_URL in productie
# 5. Test connectiviteit
# 6. Revoke oude user na 24 uur (grace period)
```

#### 3. UploadThing Keys Rotatie

```bash
# 1. Ga naar https://uploadthing.com/dashboard
# 2. Create nieuwe API key
# 3. Update environment variables:
#    - UPLOADTHING_SECRET
#    - UPLOADTHING_TOKEN
# 4. Deploy naar productie
# 5. Revoke oude key na 24 uur
```

#### 4. External API Keys Rotatie

Voor **OpenRouter**, **MultiSafepay**, etc.:

```bash
# 1. Ga naar provider dashboard
# 2. Genereer nieuwe API key
# 3. Test in staging first
# 4. Update productie environment
# 5. Monitor API calls voor errors
# 6. Revoke oude key na succesvolle deployment
```

### Emergency Rotatie (Bij Compromittatie)

Als een secret is gecompromitteerd:

```bash
# 1. ONMIDDELLIJK - Revoke de gecompromitteerde secret
#    bij de provider (UploadThing, OpenRouter, etc.)

# 2. Genereer nieuwe secret
# 3. Update productie DIRECT (wacht niet op staging)
# 4. Monitor logs voor verdachte activiteit
# 5. Notificeer team en eventueel gebruikers
# 6. Analyseer hoe de compromittatie gebeurde
# 7. Implementeer preventieve maatregelen
```

---

## CSRF Bescherming

### Hoe Het Werkt

Ons CSRF systeem (`lib/csrf.ts`) valideert:
1. **Origin/Referer headers** - Request komt van toegestane origin
2. **Session validatie** - Gebruiker heeft actieve sessie
3. **Safe methods** - GET/HEAD/OPTIONS worden niet gevalideerd

### Beveiligde Routes

CSRF is geïmplementeerd op alle state-changing endpoints:

- ✅ `/api/swipe` - Swipe acties
- ✅ `/api/block` - Block/unblock acties
- ✅ `/api/profile` (PUT) - Profile updates
- ✅ `/api/messages` - Nieuwe berichten
- ✅ `/api/admin/*` - Alle admin acties

### Nieuwe Route Beveiligen

```typescript
import { requireCSRF } from '@/lib/csrf'

export async function POST(request: NextRequest) {
  // CSRF Protection - Voeg dit toe aan ALLE POST/PUT/PATCH/DELETE routes
  const csrfCheck = await requireCSRF(request)
  if (!csrfCheck.isValid) {
    return NextResponse.json(
      { error: 'CSRF validation failed' },
      { status: 403 }
    )
  }

  // Rest van je route handler...
}
```

---

## Rate Limiting

### Configuratie

Rate limiting is geïmplementeerd met Redis support (`lib/redis-rate-limit.ts`).

#### Development
Gebruikt in-memory storage (geen Redis nodig).

#### Production
**STERK AANBEVOLEN:** Gebruik Redis via Upstash of eigen Redis server.

```bash
# .env voor productie
REDIS_URL=redis://default:password@your-redis.upstash.io:6379
```

### Rate Limit Tiers

| Endpoint | Limit | Window | Gebruik |
|----------|-------|--------|---------|
| `auth` | 5 req | 15 min | Login, password reset |
| `register` | 3 req | 10 min | Nieuwe registraties |
| `api` | 100 req | 1 min | Algemene API calls |
| `sensitive` | 10 req | 1 min | Kritieke acties |
| `report` | 5 req | 1 uur | Gebruikers rapporteren |
| `ai` | 20 req | 1 uur | AI icebreakers |

### Custom Rate Limiting

```typescript
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const result = await rateLimit(request, 'custom-endpoint', {
    maxRequests: 10,
    windowMs: 60 * 1000 // 1 minuut
  })

  if (!result.success) {
    return rateLimitResponse(result)
  }

  // Continue met request...
}
```

---

## Deployment Security

### Pre-Deployment Checklist

```bash
# 1. Environment Variables Check
✓ NODE_ENV=production
✓ Alle secrets zijn UNIEK voor productie (niet hergebruikt van dev)
✓ REDIS_URL is geconfigureerd
✓ Database gebruikt productie credentials

# 2. Security Headers Check
✓ CSP is correct geconfigureerd (geen unsafe-eval)
✓ HSTS is enabled
✓ X-Frame-Options is SAMEORIGIN

# 3. Code Security Check
✓ Geen console.log van sensitive data
✓ Geen hardcoded secrets in code
✓ Alle API routes hebben authenticatie
✓ CSRF protection op alle state-changing routes

# 4. Dependencies Check
npm audit --audit-level=high
```

### Secure Environment Variables Setup

#### Vercel Deployment

```bash
# 1. Ga naar Vercel Dashboard → Settings → Environment Variables

# 2. Add secrets als ENCRYPTED variables:
- NEXTAUTH_SECRET (encrypted)
- DATABASE_URL (encrypted)
- UPLOADTHING_SECRET (encrypted)
- REDIS_URL (encrypted)

# 3. NOOIT expose secrets in build logs
# Gebruik niet: console.log(process.env.SECRET)
```

### Productie Monitoring

```bash
# Setup Sentry voor error tracking
npm install @sentry/nextjs

# .env
SENTRY_DSN=https://your-dsn@sentry.io/project-id

# Sentry zal automatisch errors catchen en rapporteren
```

---

## Monitoring & Incident Response

### Wat Te Monitoren

1. **Failed Login Attempts**
   - 5+ mislukte pogingen binnen 15 min = verdacht
   - Check audit logs: `SELECT * FROM audit_logs WHERE action = 'LOGIN_FAILED'`

2. **Rate Limit Violations**
   - Check Redis/logs voor frequente 429 responses
   - Mogelijk DDoS attack

3. **CSRF Failures**
   - 403 errors met "CSRF validation failed"
   - Mogelijk attack of misconfiguratie

4. **Abnormal API Usage**
   - Ongebruikelijk hoge request volumes
   - Requests buiten normale gebruikerspatronen

### Incident Response Plan

#### Level 1: Verdachte Activiteit
```bash
# 1. Monitor de situatie
# 2. Check audit logs
# 3. Identificeer patroon
# 4. Eventueel IP blokkeren
```

#### Level 2: Bevestigde Attack
```bash
# 1. Activeer extra rate limiting
# 2. Tijdelijk blokkeer aanvaller IPs
# 3. Notificeer team
# 4. Monitor impact op legitieme gebruikers
```

#### Level 3: Secret Compromittatie
```bash
# 1. ONMIDDELLIJK roteer alle secrets (zie Emergency Rotatie)
# 2. Revoke gecompromitteerde credentials
# 3. Analyseer logs voor misbruik
# 4. Notificeer gebruikers indien nodig (GDPR verplichting)
# 5. Post-mortem analyse
```

---

## Security Checklist

### Daily
- [ ] Check error logs in Sentry
- [ ] Monitor rate limiting violations
- [ ] Check failed login attempts

### Weekly
- [ ] Review audit logs voor abnormale patronen
- [ ] Check dependency updates: `npm outdated`
- [ ] Review nieuwe security advisories

### Monthly
- [ ] Security dependency update: `npm audit fix`
- [ ] Review access logs
- [ ] Test backup restore procedures

### Quarterly (elke 90 dagen)
- [ ] **Roteer alle productie secrets**
- [ ] Security penetration testing
- [ ] Review en update security policies
- [ ] Team security training

### Before Major Releases
- [ ] Run security scan: `npm audit`
- [ ] Test all authentication flows
- [ ] Verify CSRF protection op nieuwe routes
- [ ] Check voor hardcoded secrets: `git grep -i "password\|secret\|key"`
- [ ] Update .env.example indien nieuwe vars

---

## Contact

Voor security issues of vragen:
- **Security Issues:** Rapporteer via private kanaal (NIET via public GitHub issues)
- **Team Lead:** [Voeg contact info toe]

---

**Laatst bijgewerkt:** 2024-12-12
**Versie:** 1.0 (Fase 1 Security Improvements)
