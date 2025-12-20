# Google OAuth Setup Guide

Dit document legt uit hoe je Google OAuth login/registratie configureert voor "Liefde Voor Iedereen".

---

## 📋 Stap 1: Google Cloud Console Setup

### 1. Ga naar Google Cloud Console

Bezoek: https://console.cloud.google.com/

### 2. Maak een nieuw project (of selecteer bestaand)

1. Klik op de project dropdown (bovenaan)
2. Klik op "NEW PROJECT"
3. Naam: `Liefde Voor Iedereen`
4. Klik "CREATE"

### 3. Activeer Google+ API (optioneel maar aanbevolen)

1. Ga naar "APIs & Services" → "Library"
2. Zoek naar "Google+ API"
3. Klik "ENABLE"

### 4. Configureer OAuth Consent Screen

1. Ga naar "APIs & Services" → "OAuth consent screen"
2. Selecteer "External" (voor publieke app)
3. Klik "CREATE"

**Vul in:**
- **App name**: `Liefde Voor Iedereen`
- **User support email**: Je support email
- **App logo**: Upload je app logo (optioneel)
- **App domain**:
  - Application home page: `https://jouwdomain.nl`
  - Application privacy policy: `https://jouwdomain.nl/privacy`
  - Application terms of service: `https://jouwdomain.nl/terms`
- **Authorized domains**: `jouwdomain.nl`
- **Developer contact**: Je email

4. Klik "SAVE AND CONTINUE"

**Scopes:**
- Klik "ADD OR REMOVE SCOPES"
- Selecteer:
  - `.../auth/userinfo.email`
  - `.../auth/userinfo.profile`
- Klik "UPDATE" en dan "SAVE AND CONTINUE"

**Test users** (alleen nodig in development):
- Voeg je eigen Google account toe als test user
- Klik "SAVE AND CONTINUE"

### 5. Maak OAuth 2.0 Credentials

1. Ga naar "APIs & Services" → "Credentials"
2. Klik "CREATE CREDENTIALS" → "OAuth client ID"
3. Application type: **Web application**
4. Name: `Liefde Voor Iedereen - Web Client`

**Authorized JavaScript origins:**
```
http://localhost:3000
http://localhost:3001
https://jouwdomain.nl
https://www.jouwdomain.nl
```

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/callback/google
http://localhost:3001/api/auth/callback/google
https://jouwdomain.nl/api/auth/callback/google
https://www.jouwdomain.nl/api/auth/callback/google
```

5. Klik "CREATE"

### 6. Kopieer je Credentials

Je krijgt nu een popup met:
- **Client ID**: Iets zoals `123456789-abc123.apps.googleusercontent.com`
- **Client Secret**: Iets zoals `GOCSPX-AbC123_XyZ789`

**❗ Bewaar deze veilig!**

---

## 🔑 Stap 2: Environment Variables Configureren

### 1. Open je `.env` bestand

```bash
# In project root
code .env
```

### 2. Voeg Google OAuth credentials toe

```env
# Google OAuth
GOOGLE_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-AbC123_XyZ789

# NextAuth URL (belangrijk!)
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-super-secret-key-here-min-32-chars

# Voor productie:
# NEXTAUTH_URL=https://jouwdomain.nl
```

### 3. Genereer NEXTAUTH_SECRET (als je die nog niet hebt)

```bash
# Optie 1: OpenSSL
openssl rand -base64 32

# Optie 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Optie 3: Online
# https://generate-secret.vercel.app/32
```

### 4. Herstart development server

```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## 🧪 Stap 3: Testen

### 1. Ga naar login page

```
http://localhost:3001/login
```

### 2. Klik op "Of registreer met Google"

Je wordt doorgestuurd naar Google login.

### 3. Login met je Google account

**Let op:** In development mode moet je account toegevoegd zijn als "Test user" in Google Cloud Console.

### 4. Verify success

- Je wordt teruggestuurd naar de app
- Je bent ingelogd met je Google account
- Check console voor:
  - `[Analytics] User identified: [user-id]`
  - `[GA] Event tracked: sign_up` (bij eerste keer)
  - `[GA] Event tracked: login` (bij volgende keren)

---

## 🚀 Stap 4: Productie Deployment

### 1. Voeg productie URLs toe in Google Cloud Console

**Authorized JavaScript origins:**
```
https://jouwdomain.nl
https://www.jouwdomain.nl
```

**Authorized redirect URIs:**
```
https://jouwdomain.nl/api/auth/callback/google
https://www.jouwdomain.nl/api/auth/callback/google
```

### 2. Update Environment Variables op Vercel/hosting

```env
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-client-secret
NEXTAUTH_URL=https://jouwdomain.nl
NEXTAUTH_SECRET=your-production-secret-key
```

### 3. Publish OAuth App

In Google Cloud Console:
1. Ga naar "OAuth consent screen"
2. Klik "PUBLISH APP"
3. Bevestig publicatie

**Verificatie:**
- Google kan je app reviewen (1-2 weken)
- Tot die tijd werkt OAuth alleen voor test users
- Na goedkeuring werkt het voor iedereen

---

## 🎨 Bonus: Customize Login Button

De Google login button zit in je login/register component. Je kunt het uiterlijk aanpassen:

```typescript
// components/auth/SocialAuth.tsx
import { signIn } from 'next-auth/react'

<button
  onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
  className="flex items-center justify-center gap-3 w-full px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
>
  {/* Google Icon */}
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    {/* Google logo SVG */}
  </svg>
  <span className="font-semibold text-gray-700">
    Inloggen met Google
  </span>
</button>
```

---

## 🔒 Security Best Practices

### 1. Bescherm je credentials

❌ **NOOIT** committen naar Git:
```bash
# .gitignore moet bevatten:
.env
.env.local
.env.production
```

### 2. Gebruik verschillende credentials per omgeving

- **Development**: Aparte Google Cloud project
- **Staging**: Aparte credentials
- **Production**: Aparte credentials

### 3. Roteer secrets regelmatig

- Genereer nieuwe NEXTAUTH_SECRET elke 6-12 maanden
- Update Google Client Secret bij security incidents

### 4. Monitor OAuth usage

In Google Cloud Console → "APIs & Services" → "Credentials":
- Check usage statistics
- Monitor for unusual activity
- Set up quota alerts

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"

**Probleem:** De redirect URI komt niet overeen.

**Oplossing:**
1. Check dat je redirect URI **exact** matcht in Google Cloud Console
2. Let op trailing slashes (met of zonder `/`)
3. Check http vs https
4. Herstart development server

### Error: "Access blocked: This app's request is invalid"

**Probleem:** OAuth consent screen niet correct geconfigureerd.

**Oplossing:**
1. Ga naar Google Cloud Console → OAuth consent screen
2. Vul alle verplichte velden in
3. Voeg je email toe als test user (development)

### Error: "This app isn't verified"

**Probleem:** App is nog niet geverifieerd door Google.

**Oplossing:**
- In development: Klik "Advanced" → "Go to [App name] (unsafe)"
- In productie: Submit app voor verificatie

### Geen Google button zichtbaar

**Probleem:** Environment variables niet correct geladen.

**Oplossing:**
1. Check `.env` bestand bevat `GOOGLE_CLIENT_ID` en `GOOGLE_CLIENT_SECRET`
2. Herstart development server
3. Check console voor errors

### User wordt aangemaakt maar niet doorgestuurd

**Probleem:** Onboarding flow for OAuth users.

**Oplossing:**
- Google users moeten door onboarding als `profileComplete: false`
- Check `lib/auth.ts` callbacks
- Redirect naar `/onboarding` indien nodig

---

## 📊 Analytics Tracking

OAuth logins/registrations worden automatisch getracked in Google Analytics:

**Bij registratie via Google:**
```javascript
trackEvent('sign_up', { method: 'google' })
trackEvent('registration_complete', { user_id: '...', method: 'google' })
```

**Bij login via Google:**
```javascript
trackEvent('login', { method: 'google' })
trackEvent('login_success', { user_id: '...', method: 'google' })
```

Check in GA:
- Events → `sign_up` → Filter by `method: google`
- Events → `login` → Filter by `method: google`

---

## ✅ Checklist

- [ ] Google Cloud project aangemaakt
- [ ] OAuth consent screen geconfigureerd
- [ ] OAuth 2.0 credentials aangemaakt
- [ ] Redirect URIs toegevoegd (development + productie)
- [ ] Environment variables ingesteld in `.env`
- [ ] NEXTAUTH_SECRET gegenereerd
- [ ] Development server herstart
- [ ] Google login getest
- [ ] Analytics events verified
- [ ] Productie URLs toegevoegd (bij deployment)
- [ ] OAuth app gepubliceerd (voor productie)

---

**✨ Google OAuth is nu werkend! Gebruikers kunnen inloggen met hun Google account. 🎉**
