# Resend Webhook Setup - Stap voor Stap

## Waarom is dit belangrijk?

Zonder webhooks kunnen we **NIET** tracken:
- 📧 Wie de email heeft geopend
- 🔗 Wie op links heeft geklikt
- 📊 Open rates en click rates
- 🎯 A/B test resultaten

**Status nu:** 0% tracking → **Na setup:** 100% tracking

---

## Setup Stappen (5 minuten)

### 1. Log in bij Resend

Ga naar: [https://resend.com/webhooks](https://resend.com/webhooks)

### 2. Klik op "Create Webhook"

### 3. Configureer de Webhook

**Webhook URL:**
```
https://liefdevooriedereen.nl/api/webhooks/resend
```

**Of voor testing (lokaal):**
```
https://your-ngrok-url.ngrok.io/api/webhooks/resend
```

### 4. Selecteer Events

Vink deze events aan:
- ✅ `email.delivered` - Email afgeleverd
- ✅ `email.opened` - Email geopend
- ✅ `email.clicked` - Link geklikt
- ✅ `email.bounced` - Email bounced
- ✅ `email.complained` - Spam klacht

### 5. Kopieer Webhook Secret

Na het aanmaken, zie je een **Signing Secret** zoals:
```
whsec_ABC123XYZ789...
```

### 6. Voeg toe aan .env

Open je `.env` file en update:

```bash
# VERVANG DEZE REGEL:
RESEND_WEBHOOK_SECRET=whsec_PLACEHOLDER_REPLACE_AFTER_WEBHOOK_SETUP

# MET JE ECHTE SECRET:
RESEND_WEBHOOK_SECRET=whsec_ABC123XYZ789...
```

### 7. Herstart je Server

```bash
# Als je dev server draait
# Stop (Ctrl+C) en start opnieuw:
npm run dev
```

---

## Testing de Webhook

### Test 1: Send Test Email

```bash
npx tsx scripts/migration-batch-send.ts VIP 1
```

### Test 2: Open de Email

Open de email die je ontvangt en klik op een link.

### Test 3: Check Database

```bash
npx tsx -e "
import { prisma } from './lib/prisma';
const email = await prisma.migrationEmail.findFirst({
  where: { openedAt: { not: null } },
  orderBy: { createdAt: 'desc' }
});
console.log('Last opened email:', {
  sentAt: email?.sentAt,
  openedAt: email?.openedAt,
  clickedAt: email?.clickedAt,
  openCount: email?.openCount
});
await prisma.\$disconnect();
"
```

**Verwacht resultaat:**
```
Last opened email: {
  sentAt: 2026-01-30T17:30:00.000Z,
  openedAt: 2026-01-30T17:31:00.000Z,  ✅
  clickedAt: 2026-01-30T17:31:30.000Z, ✅
  openCount: 1                          ✅
}
```

### Test 4: Check Migration User Status

```sql
SELECT
  "firstName",
  status,
  "lastEmailOpenedAt",
  "lastEmailClickedAt",
  "totalEmailsOpened"
FROM "MigrationUser"
WHERE "lastEmailOpenedAt" IS NOT NULL
ORDER BY "lastEmailOpenedAt" DESC
LIMIT 5;
```

---

## Troubleshooting

### Issue: Geen events ontvangen

**Check 1: Is de webhook URL correct?**
```bash
curl https://liefdevooriedereen.nl/api/webhooks/resend
# Should return: {"error":"Method not allowed"} (POST only)
```

**Check 2: Is de server running?**
```bash
# Check if Next.js is running
curl http://localhost:3000/api/webhooks/resend
```

**Check 3: Resend webhook status**
- Ga naar Resend dashboard
- Kijk bij "Webhooks"
- Check "Delivery" status
- Zou "Success" moeten zijn

### Issue: Signature verification fails

Als je deze error ziet in de logs:
```
[Webhook] Invalid signature
```

**Oplossing:**
1. Check of `RESEND_WEBHOOK_SECRET` correct is
2. Copy-paste de secret opnieuw (geen spaties!)
3. Herstart de server

### Issue: Events komen aan maar database wordt niet geüpdatet

**Check:**
```bash
# Check server logs
tail -f logs/migration.log

# Of in console waar npm run dev draait
# Je zou moeten zien:
# [Webhook] Processing email.opened for user John
# [Webhook] Email opened by John
```

---

## Lokale Testing met ngrok

Als je lokaal wilt testen:

### 1. Installeer ngrok
```bash
npm install -g ngrok
```

### 2. Start ngrok
```bash
ngrok http 3000
```

### 3. Gebruik ngrok URL in Resend
```
https://abc123.ngrok.io/api/webhooks/resend
```

### 4. Test met lokale server
```bash
npm run dev
```

Nu kun je emails versturen en realtime zien hoe webhooks binnenkomen!

---

## Verificatie Checklist

Na setup, check:

- [ ] Webhook bestaat in Resend dashboard
- [ ] Webhook URL is correct
- [ ] Alle 5 events zijn geselecteerd
- [ ] Secret is toegevoegd aan .env
- [ ] Server is herstart
- [ ] Test email verstuurd
- [ ] Test email geopend en geklikt
- [ ] Database shows openedAt timestamp
- [ ] Database shows clickedAt timestamp
- [ ] Migration user status updated
- [ ] Health check shows > 0% open rate

---

## Verwachte Resultaten

### Voor Webhook Setup:
```
Email Open Rate:    0.0% ❌
Email Click Rate:   0.0% ❌
Status tracking:    Broken ❌
```

### Na Webhook Setup:
```
Email Open Rate:    25%+ ✅
Email Click Rate:   5%+ ✅
Status tracking:    Real-time ✅
```

---

## Monitoring

### Daily Check (eerste week)
```bash
# Run health check
npx tsx scripts/check-migration-health.ts

# Check last webhook received
npx tsx -e "
import { prisma } from './lib/prisma';
const last = await prisma.migrationEmail.findFirst({
  where: { openedAt: { not: null } },
  orderBy: { openedAt: 'desc' },
  select: { openedAt: true }
});
console.log('Last webhook:', last?.openedAt);
console.log('Hours ago:', ((Date.now() - new Date(last?.openedAt).getTime()) / 3600000).toFixed(1));
await prisma.\$disconnect();
"
```

### Webhook Health Alert

Als er geen webhooks zijn ontvangen in het laatste uur, krijg je automatisch een email alert naar `ADMIN_EMAIL`.

---

## Next Steps

Na successful webhook setup:

1. ✅ **Test thoroughly** - Send meer test emails
2. ✅ **Monitor daily** - Check open rates
3. ✅ **Optimize** - Review A/B test results
4. 🚀 **Launch campaign** - Send to all segments
5. 📊 **Analyze** - Use dashboard API

---

## Support

Issues? Check:
- Resend dashboard webhook logs
- Server console output
- `SELECT * FROM "MigrationError"` for errors
- Email: admin@liefdevooriedereen.nl

---

**Na deze setup heb je REAL-TIME email tracking! 🎉**
