# Email Tracking Setup - Resend Webhooks

## 🚨 KRITIEK: Email tracking werkt momenteel NIET

De migration diagnostics tonen **0% email opens en 0% clicks**. Dit komt omdat Resend webhooks niet zijn geconfigureerd.

## Probleem

Zonder webhook tracking weten we niet:
- Wie emails opent
- Wie op links klikt
- Welke emails bounced
- Wie engaged is maar nog niet claimed

Dit maakt het onmogelijk om:
- High-intent users te identificeren voor follow-up
- Email performance te meten
- A/B tests uit te voeren
- Geïnformeerde beslissingen te nemen over de campagne

## Oplossing: Resend Webhooks Configureren

### 1. Webhook Endpoint Maken

Maak een nieuwe API route: `app/api/webhooks/resend/route.ts`

```typescript
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const { type, data } = payload

    console.log('Resend webhook received:', type)

    // Verify webhook signature (optional maar recommended)
    const signature = req.headers.get('svix-signature')
    // TODO: Implement signature verification

    // Extract email ID from Resend
    const resendId = data.email_id

    // Find corresponding migration email
    const migrationEmail = await prisma.migrationEmail.findFirst({
      where: { resendId },
      include: { migrationUser: true }
    })

    if (!migrationEmail) {
      console.log('Migration email not found for:', resendId)
      return Response.json({ received: true })
    }

    // Handle different webhook events
    switch (type) {
      case 'email.delivered':
        await handleEmailDelivered(migrationEmail, data)
        break

      case 'email.opened':
        await handleEmailOpened(migrationEmail, data)
        break

      case 'email.clicked':
        await handleEmailClicked(migrationEmail, data)
        break

      case 'email.bounced':
        await handleEmailBounced(migrationEmail, data)
        break

      case 'email.complained':
        await handleEmailComplained(migrationEmail, data)
        break

      default:
        console.log('Unknown event type:', type)
    }

    return Response.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleEmailDelivered(email: any, data: any) {
  await prisma.migrationEmail.update({
    where: { id: email.id },
    data: { deliveredAt: new Date() }
  })
}

async function handleEmailOpened(email: any, data: any) {
  // Update email record
  await prisma.migrationEmail.update({
    where: { id: email.id },
    data: { openedAt: new Date() }
  })

  // Update migration user
  await prisma.migrationUser.update({
    where: { id: email.migrationUserId },
    data: {
      lastEmailOpenedAt: new Date(),
      totalEmailsOpened: { increment: 1 },
      // Update status if still EMAIL_SENT
      status: email.migrationUser.status === 'EMAIL_SENT' ? 'EMAIL_OPENED' : undefined
    }
  })

  console.log(`📧 Email opened by: ${email.migrationUser.oldEmail}`)
}

async function handleEmailClicked(email: any, data: any) {
  // Extract link URL from webhook data
  const linkUrl = data.link?.url || ''

  // Update email record
  await prisma.migrationEmail.update({
    where: { id: email.id },
    data: { clickedAt: new Date() }
  })

  // Update migration user
  await prisma.migrationUser.update({
    where: { id: email.migrationUserId },
    data: {
      lastEmailClickedAt: new Date(),
      status: 'LINK_CLICKED'
    }
  })

  // Track click in MigrationClick table
  const linkType = linkUrl.includes('/welkom/') ? 'cta' :
                   linkUrl.includes('unsubscribe') ? 'unsubscribe' : 'other'

  await prisma.migrationClick.create({
    data: {
      migrationUserId: email.migrationUserId,
      emailId: email.id,
      linkType,
      clickedAt: new Date(),
      userAgent: data.user_agent,
      ipAddress: data.ip_address
    }
  })

  console.log(`🔗 Link clicked by: ${email.migrationUser.oldEmail}`)
}

async function handleEmailBounced(email: any, data: any) {
  await prisma.migrationEmail.update({
    where: { id: email.id },
    data: {
      bouncedAt: new Date(),
      errorMessage: `Bounced: ${data.bounce_type}`
    }
  })

  console.log(`⚠️  Email bounced for: ${email.migrationUser.oldEmail}`)
}

async function handleEmailComplained(email: any, data: any) {
  // User marked as spam - important for deliverability
  console.log(`🚨 Spam complaint from: ${email.migrationUser.oldEmail}`)

  // Optionally update user to not send more emails
  await prisma.migrationUser.update({
    where: { id: email.migrationUserId },
    data: {
      status: 'EXPIRED' // Or create a UNSUBSCRIBED status
    }
  })
}
```

### 2. Configureer Webhook in Resend Dashboard

1. Ga naar https://resend.com/webhooks
2. Klik op "Add Webhook"
3. Vul in:
   - **URL**: `https://liefdeveoriedereen.nl/api/webhooks/resend`
   - **Events**: Selecteer:
     - ✅ `email.delivered`
     - ✅ `email.opened`
     - ✅ `email.clicked`
     - ✅ `email.bounced`
     - ✅ `email.complained`
4. Kopieer de webhook signing secret
5. Voeg toe aan `.env`: `RESEND_WEBHOOK_SECRET=whsec_...`

### 3. Test Webhook Lokaal

Gebruik Resend CLI of ngrok voor lokale testing:

```bash
# Met ngrok
ngrok http 3000

# Gebruik ngrok URL in Resend dashboard:
# https://abc123.ngrok.io/api/webhooks/resend
```

### 4. Update Email Verzend Code

Zorg dat `resendId` wordt opgeslagen bij verzenden:

```typescript
// In migration-batch-send.ts of waar emails worden verzonden

const { data, error } = await resend.emails.send({
  from: 'Liefde voor Iedereen <welkom@liefdeveoriedereen.nl>',
  to: user.oldEmail,
  subject: subject,
  react: EmailTemplate({ ... })
})

if (data?.id) {
  // ✅ BELANGRIJK: Sla Resend ID op!
  await prisma.migrationEmail.create({
    data: {
      migrationUserId: user.id,
      emailType: 'WELCOME',
      subject: subject,
      resendId: data.id,  // <-- Dit is cruciaal!
      sentAt: new Date()
    }
  })
}
```

## Verificatie

Na setup, test met:

```typescript
// scripts/test-email-tracking.ts

import { resend } from '@/lib/email/resend'

const testEmail = await resend.emails.send({
  from: 'test@liefdeveoriedereen.nl',
  to: 'jouw-email@example.com',
  subject: 'Test Email Tracking',
  html: '<p>Klik <a href="https://liefdeveoriedereen.nl/test">hier</a></p>'
})

console.log('Test email sent:', testEmail.data?.id)
console.log('Check webhook events in Resend dashboard')
```

Check na 5 minuten in database:
```sql
SELECT * FROM "MigrationEmail" WHERE "resendId" = 'the-test-id';
-- openedAt en clickedAt zouden moeten zijn ingevuld
```

## Alternatief: UTM Tracking

Als webhooks niet meteen kunnen, gebruik dan UTM parameters:

```typescript
const claimUrl = `https://liefdeveoriedereen.nl/welkom/${token}?utm_source=migration&utm_medium=email&utm_campaign=wave1&utm_content=${user.segment.toLowerCase()}`

// Track in landing page:
// app/welkom/[token]/page.tsx
const searchParams = useSearchParams()
const utmSource = searchParams.get('utm_source')

if (utmSource === 'migration') {
  // User came from email - update lastEmailClickedAt
  await updateMigrationUserClick(token)
}
```

## Huidige Impact

**Zonder tracking:**
- ❌ Geen inzicht in email performance
- ❌ Kunnen high-intent users niet identificeren
- ❌ Geen A/B test resultaten
- ❌ Geen bounce detection
- ❌ Blindvliegen met campagne optimalisatie

**Met tracking:**
- ✅ Real-time open/click rates
- ✅ Identificeer engaged users voor follow-up
- ✅ A/B test subject lines
- ✅ Detect spam/bounce issues vroeg
- ✅ Data-driven campagne optimalisatie

## Prioriteit

⚡ **HOOG - Moet binnen 24 uur gefixt zijn**

De campagne draait nu zonder instrumentatie. Dit is als autorijden met dichtgeplakte ramen - je weet niet waar je naartoe gaat.

---

*Laatst bijgewerkt: 30 januari 2026*
