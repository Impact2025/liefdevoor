# User Migration Script

Dit script migreert gebruikers van de oude MySQL database (`oudedatabase.sql`) naar het nieuwe PostgreSQL systeem.

## 📊 Geschatte Aantallen

Uit de oude database:
- **~16,000+ gebruikers** in totaal
- Verwachte migratie: **8,000-12,000 actieve gebruikers**
  - Inactieve accounts worden overgeslagen
  - Accounts zonder geldig email worden overgeslagen
  - Accounts jonger dan 18 jaar worden overgeslagen

## 🔄 Wat wordt gemigreerd?

### Basis Gebruikersgegevens
- ✅ Email adres (wordt email in nieuwe DB)
- ✅ Naam
- ✅ Wachtwoord (oude bcrypt hashes blijven werken)
- ✅ Geslacht (M/F → MALE/FEMALE)
- ✅ Geboortedatum (met validatie: 18+ jaar)
- ✅ Stad
- ✅ Bio (gecombineerd uit `about_me` en `interested_in`)
- ✅ Registratiedatum
- ✅ Admin rol (indien van toepassing)
- ✅ Profiel foto status

### Wat wordt NIET gemigreerd
- ❌ Berichten (te complex, oude systeem)
- ❌ Matches (oude systeem anders)
- ❌ Foto's (moeten opnieuw geüpload worden)
- ❌ Premium membership status (opnieuw activeren)
- ❌ Bezoekers/views (beginnen op nieuw)

## 📋 Voorwaarden

Voordat je begint:

1. **Backup je nieuwe database!**
   ```bash
   # Via Neon.tech dashboard of:
   npx prisma db push --force-reset
   ```

2. **Zorg dat de oude database file op de juiste plek staat:**
   ```
   D:\Datingsite2026\Huidigedatabase\oudedatabase.sql
   ```

3. **Test environment klaar:**
   - PostgreSQL database actief
   - DATABASE_URL ingesteld in .env
   - Prisma client gegenereerd

## 🚀 Gebruik

### Stap 1: Dry Run (aanbevolen)

Eerst een test run om te zien hoeveel users er gemigreerd kunnen worden:

```bash
npx tsx scripts/migrate-users.ts --dry-run
```

### Stap 2: Daadwerkelijke Migratie

Als alles er goed uitziet:

```bash
npx tsx scripts/migrate-users.ts
```

### Stap 3: Verificatie

Check de database:

```bash
npx prisma studio
```

Of via SQL:

```bash
npx prisma db execute --stdin <<EOF
SELECT COUNT(*) as total_users FROM "User";
SELECT gender, COUNT(*) FROM "User" GROUP BY gender;
SELECT role, COUNT(*) FROM "User" GROUP BY role;
EOF
```

## ⚙️ Configuratie Opties

Je kunt het script aanpassen in `migrate-users.ts`:

```typescript
// Skip inactieve users
if (active === 0) {
  skippedCount++
  continue
}

// Minimale leeftijd aanpassen
if (age < 18 || age > 100) {
  birthDate = null
}
```

## 🔍 Tijdens Migratie

Het script toont real-time voortgang:

```
🚀 Starting user migration...

📖 Reading userinfo data...
✅ Loaded 12,543 userinfo records

📖 Reading user data...
✅ Migrated 100 users...
✅ Migrated 200 users...
...

📊 Migration Summary:
   Total users found: 16,347
   Successfully migrated: 11,892
   Skipped: 4,255
   Errors: 200

✅ Migration complete!
```

## ⚠️ Veelvoorkomende Problemen

### Problem: Duplicate email errors
**Oplossing**: Het script slaat automatisch duplicaten over. Dit is normaal als je meerdere keren migreert.

### Problem: Invalid birth dates
**Oplossing**: Users met ongeldige geboortedatums krijgen `null` en kunnen later hun birthDate invullen.

### Problem: Connection timeout
**Oplossing**: De database heeft mogelijk te veel load. Wacht even en probeer opnieuw.

### Problem: "Cannot find module"
**Oplossing**: Run eerst:
```bash
npm install
npx prisma generate
```

## 📧 Gebruikers Notificatie

Na succesvolle migratie kun je de gemigreerde users een email sturen:

```typescript
// Voeg toe aan het einde van migrate-users.ts
const migratedUsers = await prisma.user.findMany({
  where: {
    createdAt: {
      gte: new Date('2025-12-16')  // Vandaag
    }
  },
  select: { email: true }
})

console.log(`📧 Send welcome email to ${migratedUsers.length} users`)
```

## 🔐 Wachtwoorden

De oude wachtwoorden zijn bcrypt hashes. Deze blijven werken met NextAuth omdat:
- Oude DB: `$2y$10$...` (PHP bcrypt)
- Nieuwe DB: `$2y$10$...` (werkt met bcryptjs)

Users kunnen inloggen met hun oude wachtwoord!

## 📝 Na Migratie

1. **Test inloggen** met een paar oude accounts
2. **Check profielen** of alle data correct is
3. **Stuur welkomstmail** naar gemigreerde users
4. **Monitoor errors** in de eerste dagen
5. **Backup nieuwe database** met gemigreerde data

## 🎯 Geschat Resultaat

Van de ~16,000 users verwacht ik:

- ✅ **~11,000** actieve gebruikers met geldig email
- ⚠️ **~3,000** overgeslagen (geen email, inactief)
- ❌ **~2,000** errors (dubbele emails, corrupte data)

## 💡 Tips

1. **Run eerst op test database** voordat je naar productie gaat
2. **Maak backup** voor EN na migratie
3. **Monitoor database groei** - 11,000 users = ~50MB data
4. **Check Neon.tech limits** voor je database plan
5. **Test inloggen** met verschillende old accounts

## 🆘 Hulp Nodig?

Bij problemen:
1. Check de console output voor specifieke errors
2. Bekijk de skipped users om te zien waarom ze werden overgeslagen
3. Test met een kleine subset eerst (pas het script aan om slechts 100 users te migreren)

Veel succes met de migratie! 🚀
