/**
 * FAQ Articles: Privacy & Gegevens (Privacy & Data)
 * 4 articles about privacy, GDPR, and data management
 */

import { FAQArticleData } from './articles-getting-started'

export const privacyArticles: FAQArticleData[] = [
  {
    categorySlug: 'privacy-gegevens',
    title: 'How is my data protected?',
    titleNl: 'Hoe worden mijn gegevens beschermd?',
    slug: 'gegevens-bescherming',
    excerpt: 'Alles over hoe wij je privacy en gegevens beschermen',
    content: 'Data protection information',
    contentNl: `# Hoe worden mijn gegevens beschermd?

Je privacy is onze prioriteit. Hier lees je hoe we je gegevens beschermen.

## Onze beveiligingsmaatregelen

### Encryptie
- Alle data wordt **versleuteld** opgeslagen
- **HTTPS/SSL** voor veilige verbindingen
- Wachtwoorden worden **gehasht** (nooit leesbaar opgeslagen)

### Beveiligde infrastructuur
- Data opgeslagen in beveiligde datacenters in de **EU**
- Regelmatige **security audits**
- 24/7 monitoring op verdachte activiteiten

### Toegangscontrole
- Strikte toegangsrechten voor medewerkers
- Twee-factor authenticatie intern
- Logging van alle datatoegang

## AVG / GDPR Compliance

Wij voldoen aan de Europese privacywetgeving (AVG/GDPR):

### Jouw rechten:

**Recht op inzage**
Je kunt altijd opvragen welke gegevens we van je hebben.

**Recht op rectificatie**
Je kunt je gegevens aanpassen als ze incorrect zijn.

**Recht op vergetelheid**
Je kunt je account en alle gegevens laten verwijderen.

**Recht op dataportabiliteit**
Je kunt een kopie van je gegevens downloaden.

**Recht op bezwaar**
Je kunt bezwaar maken tegen bepaalde verwerkingen.

## Wat we verzamelen

### Gegevens die je zelf invoert:
- Naam, e-mail, geboortedatum
- Profielfoto's en bio
- Zoekvoorkeuren
- Berichten

### Automatisch verzameld:
- Login-informatie
- Apparaat-informatie
- Gebruiksstatistieken
- Locatie (op basis van postcode)

## Wat we NIET doen

❌ Je gegevens verkopen aan derden
❌ Je berichten delen met anderen
❌ Je exacte locatie opslaan (alleen postcode)
❌ Je betalingsgegevens opslaan (verwerkt door betalingsprovider)
❌ Je wachtwoord kunnen inzien

## Met wie we delen

We delen beperkt data met:
- **Betalingsproviders** (voor transacties)
- **Cloud providers** (voor hosting)
- **Autoriteiten** (alleen bij wettelijke verplichting)

Dit gebeurt altijd met passende beveiligingsmaatregelen.

## Veelgestelde vragen

**Kunnen andere gebruikers mijn e-mailadres zien?**
Nee, je e-mailadres is altijd privé.

**Wordt mijn exacte locatie gedeeld?**
Nee, alleen de afstand tot anderen wordt getoond, nooit je exacte adres.

**Hoe lang bewaren jullie mijn gegevens?**
Tot je je account verwijdert, plus een wettelijke bewaartermijn.

**Waar kan ik het volledige privacybeleid lezen?**
Op [liefdevooriedereen.nl/privacy](/privacy)`,
    keywords: ['privacy', 'gegevens', 'bescherming', 'avg', 'gdpr', 'veilig', 'beveiliging', 'data'],
    isFeatured: true,
    order: 1
  },
  {
    categorySlug: 'privacy-gegevens',
    title: 'How do I download my data?',
    titleNl: 'Hoe download ik mijn data?',
    slug: 'data-downloaden',
    excerpt: 'Vraag een kopie van al je gegevens aan',
    content: 'How to download your data',
    contentNl: `# Hoe download ik mijn data?

Je hebt het recht om een kopie van al je gegevens te downloaden. Hier lees je hoe.

## Data exporteren

### Stap voor stap:
1. Ga naar **Instellingen** ⚙️
2. Tik op **"Privacy"** of **"Mijn gegevens"**
3. Kies **"Data exporteren"** of **"Download mijn data"**
4. Bevestig je identiteit (mogelijk via e-mail)
5. Wacht op de export

### Verwerkingstijd:
- Kleine accounts: minuten tot uren
- Grote accounts (veel foto's/berichten): tot 48 uur
- Je ontvangt een e-mail wanneer de export klaar is

## Wat zit er in de export?

### Profielgegevens
- Naam, e-mail, geboortedatum
- Bio en interesses
- Instellingen en voorkeuren

### Foto's
- Al je geüploade profielfoto's
- Verificatiefoto's (indien van toepassing)

### Berichten
- Alle gesprekken met matches
- Verzonden en ontvangen berichten
- Gedeelde media

### Activiteit
- Swipe-geschiedenis
- Match-informatie
- Login-geschiedenis

### Betalingen
- Aankoopgeschiedenis
- Facturen

## Export formaat

- **JSON-bestanden** voor gestructureerde data
- **Originele afbeeldingen** voor foto's
- Alles in een **ZIP-bestand**

## Veelgestelde vragen

**Hoe vaak kan ik mijn data exporteren?**
Je kunt eenmaal per 30 dagen een export aanvragen.

**Bevat de export berichten van geblokkeerde/verwijderde matches?**
Berichten van verwijderde matches kunnen ontbreken. Geblokkeerde gesprekken worden wel meegenomen.

**In welk formaat krijg ik mijn foto's?**
In het originele formaat waarin je ze hebt geüpload.

**Kan ik specifieke gegevens aanvragen?**
De export bevat standaard alles. Voor specifieke verzoeken, neem contact op met support.

## Privacy bij export

- De downloadlink is **beveiligd** en tijdelijk geldig
- Je moet **ingelogd** zijn om te downloaden
- De link wordt naar je **e-mail** gestuurd

## Waarvoor kun je je data gebruiken?

✅ Inzicht in wat we van je weten
✅ Backup van je berichten en foto's
✅ Overdracht naar een andere dienst
✅ Controle of je gegevens correct zijn`,
    keywords: ['download', 'data', 'export', 'kopie', 'gegevens', 'backup', 'opvragen'],
    isFeatured: false,
    order: 2
  },
  {
    categorySlug: 'privacy-gegevens',
    title: 'How do I completely delete my account and data?',
    titleNl: 'Hoe verwijder ik mijn account en data volledig?',
    slug: 'account-data-verwijderen',
    excerpt: 'Permanent je account en alle gegevens verwijderen',
    content: 'How to delete account and data',
    contentNl: `# Hoe verwijder ik mijn account en data volledig?

Als je Liefde Voor Iedereen wilt verlaten, kun je je account en alle data permanent verwijderen.

## Voor je verwijdert

### Overweeg eerst:
- **Pauzeren** - Tijdelijk je profiel verbergen
- **Data downloaden** - Maak eerst een backup
- **Abonnement opzeggen** - Voorkom verdere afschrijvingen

### Dit is permanent!
⚠️ Verwijderde accounts kunnen NIET worden hersteld
⚠️ Al je matches en berichten zijn voorgoed weg
⚠️ Je foto's en profiel worden verwijderd

## Account verwijderen

### Stap voor stap:
1. Ga naar **Instellingen** ⚙️
2. Scroll naar **"Account"**
3. Tik op **"Account verwijderen"**
4. Lees de waarschuwing
5. Bevestig door **"VERWIJDEREN"** te typen
6. Klik op de definitieve verwijderknop

### Verificatie:
- Mogelijk moet je je wachtwoord invoeren
- Of een bevestigingslink in je e-mail aanklikken

## Wat wordt verwijderd?

### Direct verwijderd:
- Je profiel (naam, bio, voorkeuren)
- Al je foto's
- Voice Intro
- Swipe-geschiedenis
- Matches en gesprekken
- Zoekvoorkeuren

### Binnen 30 dagen:
- Backup-kopieën
- Server logs

### Wat we bewaren (wettelijk verplicht):
- Transactiegegevens (7 jaar voor belastingdoeleinden)
- Geanonimiseerde statistieken

## Bedenktijd

Na verwijdering heb je **14 dagen bedenktijd**:
- Log binnen 14 dagen in om te herstellen
- Na 14 dagen is verwijdering definitief
- Je moet wel je wachtwoord weten

## Abonnement

⚠️ **Belangrijk:**
- Verwijderen stopt NIET automatisch je abonnement
- Zeg eerst je abonnement op via Instellingen → Abonnement
- Of via je bank/creditcard als automatische incasso

## Veelgestelde vragen

**Hoelang duurt volledige verwijdering?**
Je profiel is direct onzichtbaar. Volledige verwijdering uit alle systemen duurt tot 30 dagen.

**Kan ik later een nieuw account maken?**
Ja, met hetzelfde e-mailadres kun je opnieuw beginnen (na 30 dagen).

**Worden mijn berichten ook bij de ander verwijderd?**
Ja, gesprekken verdwijnen volledig bij beide partijen.

**Wat als ik mijn wachtwoord niet weet?**
Reset je wachtwoord via de inlogpagina voordat je verwijdert.

## Contact

Lukt het niet via de app?
E-mail: privacy@liefdevooriedereen.nl
Onderwerp: "Accountverwijdering"`,
    keywords: ['verwijderen', 'account', 'data', 'wissen', 'permanent', 'delete', 'stoppen', 'weg'],
    isFeatured: false,
    order: 3
  },
  {
    categorySlug: 'privacy-gegevens',
    title: 'How do I manage my cookie settings?',
    titleNl: 'Hoe beheer ik mijn cookie-instellingen?',
    slug: 'cookie-instellingen',
    excerpt: 'Pas je cookie-voorkeuren aan',
    content: 'Cookie settings management',
    contentNl: `# Hoe beheer ik mijn cookie-instellingen?

Cookies helpen ons de app beter te maken. Hier leer je hoe je je voorkeuren kunt aanpassen.

## Wat zijn cookies?

Cookies zijn kleine tekstbestanden die informatie opslaan:
- **Functionele cookies** - Nodig om de app te laten werken
- **Analytische cookies** - Helpen ons de app te verbeteren
- **Marketing cookies** - Voor gepersonaliseerde advertenties

## Cookie-voorkeuren aanpassen

### Via de website:
1. Ga naar [liefdevooriedereen.nl](/cookies)
2. Scroll naar **"Cookie-instellingen"**
3. Pas je voorkeuren aan
4. Klik op **"Opslaan"**

### Via de app:
1. Ga naar **Instellingen** ⚙️
2. Tik op **"Privacy"**
3. Zoek **"Cookie-voorkeuren"**
4. Pas aan en sla op

## Cookie-categorieën

### Noodzakelijke cookies ✅
**Altijd aan** - Zonder deze werkt de app niet.
- Inloggen en sessie behouden
- Veiligheid en beveiliging
- Basis functionaliteit

### Analytische cookies
**Optioneel** - Helpen ons begrijpen hoe je de app gebruikt.
- Welke pagina's worden bezocht
- Hoelang je op de app bent
- Technische problemen detecteren

### Marketing cookies
**Optioneel** - Voor gepersonaliseerde advertenties.
- Advertenties afstemmen op je interesses
- Effectiviteit van campagnes meten
- Social media integraties

## Je keuze maken

| Doel | Aanbeveling |
|------|-------------|
| Maximale privacy | Alleen noodzakelijke aan |
| Betere ervaring | Noodzakelijk + Analytisch |
| Gepersonaliseerd | Alles aan |

## Cookies verwijderen

### In je browser:
1. Ga naar browserinstellingen
2. Zoek "Privacy" of "Cookies"
3. Kies voor cookies wissen
4. Selecteer liefdevooriedereen.nl

**Let op:** Na het wissen moet je mogelijk opnieuw inloggen.

### In de app:
1. Ga naar Instellingen → Privacy
2. Tik op "Cookies wissen"
3. Bevestig

## Veelgestelde vragen

**Wat gebeurt er als ik alle cookies weiger?**
De app blijft werken (noodzakelijke cookies blijven). Je mist gepersonaliseerde ervaringen en advertenties kunnen minder relevant zijn.

**Hoe vaak moet ik mijn voorkeuren instellen?**
Eenmalig. Je keuze wordt opgeslagen totdat je het wijzigt.

**Beïnvloeden cookies mijn privacy?**
Analytische en marketing cookies volgen gedrag, maar niet persoonlijk identificeerbaar. Noodzakelijke cookies zijn privacy-vriendelijk.

**Kan ik cookies per categorie uitschakelen?**
Ja, behalve noodzakelijke cookies - die zijn altijd vereist.

## Meer informatie

Lees ons volledige cookiebeleid op:
[liefdevooriedereen.nl/cookies](/cookies)`,
    keywords: ['cookies', 'cookie', 'instellingen', 'privacy', 'tracking', 'voorkeuren', 'gdpr'],
    isFeatured: false,
    order: 4
  }
]
