# Error Monitoring & Daily Reports

## Overzicht

Het systeem stuurt elke ochtend om 08:00 een Daily Management Report naar alle admins. Dit rapport bevat een systeem status gebaseerd op échte systeem errors.

## Wat telt als Systeem Error?

Het systeem telt **ALLEEN** échte technische fouten die aandacht vereisen:

### ✅ Wordt WEL geteld als error:
- Database connection failures
- Payment processing errors
- Email delivery failures
- API integration failures
- Application crashes
- Data integrity errors
- File upload/processing errors
- Third-party service failures

### ❌ Wordt NIET geteld als error:
Deze zijn **normale beveiligingsgebeurtenissen** en verwacht gedrag:

- `LOGIN_FAILED` - Mislukte login pogingen (verkeerd wachtwoord, user not found, etc.)
- `REGISTER_HONEYPOT_TRIGGERED` - Spam bots geblokkeerd door honeypot
- `REGISTER_BLOCKED_EMAIL` - Registratie geblokkeerd (wegwerp email, etc.)
- `REGISTER_SPAM_DETECTED` - Spam detectie triggers
- `REGISTER_BLOCKED_DOMAIN` - Geblokkeerde email domeinen
- `PASSWORD_RESET_INVALID_TOKEN` - Ongeldige password reset tokens
- `EMAIL_VERIFICATION_FAILED` - Ongeldige verificatie tokens
- `SUSPICIOUS_ACTIVITY_BLOCKED` - Verdachte activiteit geblokkeerd

## Systeem Status Levels

### 🟢 OK
- 0 systeem errors
- < 10 openstaande reports
- **Actie:** Geen actie vereist

### ⚠️ WARNING
- 1-5 systeem errors OF
- 10-20 openstaande reports
- **Actie:** Controleer error logs, geen urgentie

### 🚨 CRITICAL
- > 5 systeem errors OF
- > 20 openstaande reports
- **Actie:** Directe aandacht vereist!

## Error Logging Best Practices

### Echte Systeem Errors
```typescript
await prisma.auditLog.create({
  data: {
    action: 'PAYMENT_PROCESSING_FAILED',
    success: false, // ← Dit telt als error!
    userId: user.id,
    details: JSON.stringify({
      error: error.message,
      provider: 'stripe',
      amount: 14.95
    })
  }
})
```

### Beveiligingsgebeurtenissen (geen error)
```typescript
await prisma.auditLog.create({
  data: {
    action: 'LOGIN_FAILED', // ← Dit telt NIET als error
    success: false,
    userId: user.id,
    details: JSON.stringify({
      reason: 'invalid_password'
    })
  }
})
```

## Monitoring

### Check huidige error count
```bash
node scripts/test-error-count.js
```

### Check alle errors laatste 24u
```bash
node scripts/check-errors.js
```

### Handmatig daily report triggeren
```bash
curl -X GET http://localhost:3000/api/cron/daily-management-report \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Configuration

### Email ontvangers configureren
In `.env`:
```env
ADMIN_EMAILS=admin@liefdevooriedereen.nl,tech@liefdevooriedereen.nl
```

Of via database: alle users met `role: 'ADMIN'` en geverifieerde emails ontvangen het rapport.

## Troubleshooting

### Q: Ik ontvang geen daily reports
- Check of ADMIN_EMAILS is geconfigureerd in .env
- Check of je admin account een geverifieerde email heeft
- Check de cron job configuratie (Vercel Cron of vergelijkbaar)

### Q: Ik zie teveel WARNING statuses
- Check of je logging misschien verkeerde action types gebruikt
- Voeg eventueel extra beveiligingsgebeurtenissen toe aan de exclusion list

### Q: Waar kan ik de exclusion list aanpassen?
`app/api/cron/daily-management-report/route.ts` regel 143-153

## API Endpoints

### Daily Report Cron
- **Endpoint:** `GET /api/cron/daily-management-report`
- **Auth:** Bearer token (CRON_SECRET)
- **Schedule:** 0 8 * * * (daily at 08:00 CET)
- **Response:** Metrics + success status

## Maintenance

### Cleanup oude audit logs
Audit logs groeien over tijd. Overweeg een cleanup cron:
```sql
DELETE FROM "AuditLog"
WHERE "createdAt" < NOW() - INTERVAL '90 days'
  AND success = false
  AND action IN ('LOGIN_FAILED', 'REGISTER_HONEYPOT_TRIGGERED');
```

Bewaar échte systeem errors langer voor analyse!
