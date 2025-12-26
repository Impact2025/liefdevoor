/**
 * FAQ Articles: Technische Hulp (Technical Help)
 * 4 articles about technical issues and troubleshooting
 */

import { FAQArticleData } from './articles-getting-started'

export const technicalArticles: FAQArticleData[] = [
  {
    categorySlug: 'technische-hulp',
    title: 'The app isn\'t loading, what now?',
    titleNl: 'De app laadt niet, wat nu?',
    slug: 'app-laadt-niet',
    excerpt: 'Oplossingen wanneer de app niet goed laadt of vastloopt',
    content: 'App not loading troubleshooting',
    contentNl: `# De app laadt niet, wat nu?

Als de app niet laadt of vastloopt, probeer deze stappen.

## Snelle oplossingen

### 1. Check je internetverbinding
- Is wifi of mobiele data ingeschakeld?
- Probeer een andere website te openen
- Schakel vliegtuigmodus even aan en uit

### 2. Ververs de app
- **In de browser**: Druk op F5 of trek omlaag
- **In de app**: Sluit volledig af en open opnieuw

### 3. Herstart de app
- Sluit de app volledig (niet alleen minimaliseren)
- Wacht 10 seconden
- Open de app opnieuw

### 4. Herstart je apparaat
Soms helpt een volledige herstart van je telefoon of computer.

## Geavanceerde oplossingen

### Cache wissen
Zie het artikel "Hoe wis ik de cache?" voor gedetailleerde instructies.

### App opnieuw installeren
1. Verwijder de app
2. Herstart je apparaat
3. Download opnieuw vanuit de App Store/Play Store
4. Log in met je bestaande account

### Browser proberen
Als de app niet werkt, probeer de website:
1. Open een browser
2. Ga naar [liefdevooriedereen.nl](https://liefdevooriedereen.nl)
3. Log in

## Veelvoorkomende problemen

### Wit scherm
- Wacht 30 seconden (laden kan even duren)
- Ververs de pagina
- Wis de cache

### Eindeloos laden
- Check je internetsnelheid
- Probeer wifi in plaats van mobiel (of andersom)
- Wis de cache

### Foutmelding
- Noteer de exacte foutmelding
- Ververs en probeer opnieuw
- Neem contact op met support met de foutmelding

### "Geen verbinding"
- Check of je internet werkt
- Schakel VPN uit als je die gebruikt
- Probeer een ander netwerk

## Systeemvereisten

### Smartphone:
- iOS 13 of hoger
- Android 8 of hoger

### Browser:
- Chrome, Firefox, Safari of Edge
- Nieuwste of één-na-nieuwste versie

## Nog steeds problemen?

Als niets werkt:
1. Noteer wat je hebt geprobeerd
2. Maak een screenshot van eventuele foutmeldingen
3. Neem contact op met support@liefdevooriedereen.nl`,
    keywords: ['laden', 'werkt niet', 'kapot', 'fout', 'error', 'vastgelopen', 'crash', 'probleem'],
    isFeatured: true,
    order: 1
  },
  {
    categorySlug: 'technische-hulp',
    title: 'I\'m not getting notifications, what can I do?',
    titleNl: 'Ik krijg geen meldingen, wat kan ik doen?',
    slug: 'geen-meldingen',
    excerpt: 'Oplossingen wanneer je geen pushmeldingen ontvangt',
    content: 'Notification troubleshooting',
    contentNl: `# Ik krijg geen meldingen, wat kan ik doen?

Mis je meldingen over matches en berichten? Hier zijn de oplossingen.

## Check app-instellingen

### In Liefde Voor Iedereen:
1. Ga naar **Instellingen** ⚙️
2. Tik op **"Meldingen"** of **"Notificaties"**
3. Zorg dat alle gewenste meldingen **aan** staan:
   - Nieuwe matches
   - Nieuwe berichten
   - Super Likes
   - Andere activiteit

## Check telefooninstellingen

### iPhone (iOS):
1. Ga naar **Instellingen** (van je telefoon)
2. Scroll naar **Liefde Voor Iedereen**
3. Tik op **"Meldingen"**
4. Zet **"Sta meldingen toe"** aan
5. Kies: Vergrendelscherm, Berichtencentrum, Banners

### Android:
1. Ga naar **Instellingen** (van je telefoon)
2. Tik op **"Apps"** of **"Applicaties"**
3. Zoek **Liefde Voor Iedereen**
4. Tik op **"Meldingen"**
5. Zet meldingen **aan**

## Veelvoorkomende problemen

### "Niet storen" modus
- Check of "Niet storen" uit staat
- Of voeg Liefde Voor Iedereen toe aan uitzonderingen

### Batterijbesparing
- Batterijbesparingsmodi kunnen meldingen blokkeren
- Voeg de app toe aan uitzonderingen
- Op Android: Schakel batterij-optimalisatie uit voor de app

### Focus modus (iPhone)
- Check of Focus/Concentratie-modus meldingen blokkeert
- Voeg de app toe aan toegestane meldingen

### Achtergrond-verversing
1. Ga naar telefooninstellingen
2. Zoek "Achtergrond-appverversing"
3. Zet aan voor Liefde Voor Iedereen

## Extra stappen

### Log uit en in
1. Ga naar Instellingen in de app
2. Tik op "Uitloggen"
3. Sluit de app volledig
4. Open en log opnieuw in
5. Accepteer meldingen wanneer gevraagd

### App opnieuw installeren
1. Verwijder de app
2. Download opnieuw
3. Log in
4. **Belangrijk:** Accepteer "Toestaan" bij de meldingenvraag!

## Veelgestelde vragen

**Ik heb per ongeluk "Niet toestaan" gekozen bij meldingen**
Ga naar je telefooninstellingen om dit handmatig aan te zetten (zie stappen hierboven).

**Meldingen werken wel op wifi, niet op mobiel**
Check of je mobiele data voor de app is ingeschakeld.

**Ik krijg meldingen met vertraging**
Dit kan komen door batterijbesparing of slechte verbinding. Check je instellingen.

**Werken meldingen op meerdere apparaten?**
Ja, maar alleen op apparaten waar je bent ingelogd.`,
    keywords: ['meldingen', 'notificaties', 'push', 'geen melding', 'niet ontvangen', 'alert', 'bericht'],
    isFeatured: false,
    order: 2
  },
  {
    categorySlug: 'technische-hulp',
    title: 'How do I clear the cache?',
    titleNl: 'Hoe wis ik de cache?',
    slug: 'cache-wissen',
    excerpt: 'Stapsgewijze uitleg voor het wissen van de app-cache',
    content: 'How to clear cache',
    contentNl: `# Hoe wis ik de cache?

Cache wissen kan veel problemen oplossen. Hier leer je hoe.

## Wat is cache?

Cache zijn tijdelijke bestanden die de app sneller maken:
- Eerder geladen afbeeldingen
- Sessie-informatie
- Tijdelijke data

Soms raakt cache corrupt en veroorzaakt het problemen.

## Cache wissen per platform

### In de app zelf:
1. Ga naar **Instellingen** ⚙️
2. Scroll naar **"Opslag"** of **"Cache"**
3. Tik op **"Cache wissen"**
4. Bevestig

### iPhone (Safari):
1. Ga naar **Instellingen** (telefoon)
2. Scroll naar **Safari**
3. Tik op **"Wis geschiedenis en websitedata"**
4. Bevestig

### iPhone (app):
1. Ga naar **Instellingen** (telefoon)
2. Tik op **Algemeen** → **iPhone-opslag**
3. Zoek **Liefde Voor Iedereen**
4. Tik op **"Offload app"** of **"Verwijder app"**
5. Installeer opnieuw

### Android:
1. Ga naar **Instellingen** (telefoon)
2. Tik op **Apps** of **Applicaties**
3. Zoek **Liefde Voor Iedereen**
4. Tik op **Opslag**
5. Tik op **"Cache wissen"**

### Chrome (desktop):
1. Klik op de drie puntjes ⋮
2. Ga naar **Instellingen**
3. Klik op **Privacy en beveiliging**
4. Klik op **Browsegegevens wissen**
5. Selecteer "Afbeeldingen en bestanden in cache"
6. Klik **Gegevens wissen**

### Firefox:
1. Klik op de drie streepjes ☰
2. Ga naar **Instellingen** → **Privacy**
3. Klik op **Gegevens wissen**
4. Selecteer "Cache"
5. Klik **Wissen**

## Na het wissen

- Je moet mogelijk opnieuw inloggen
- De app kan even langzamer laden (bouwt nieuwe cache op)
- Je foto's en berichten zijn NIET verwijderd

## Wanneer cache wissen?

✅ App laadt niet goed
✅ Afbeeldingen laden niet
✅ App gedraagt zich vreemd
✅ Na een grote update
✅ Als support het adviseert

## Veelgestelde vragen

**Verlies ik mijn matches of berichten?**
Nee! Cache wissen verwijdert alleen tijdelijke bestanden. Je account, matches en berichten blijven bewaard.

**Hoe vaak moet ik cache wissen?**
Alleen als je problemen ervaart. Niet nodig als alles werkt.

**Mijn foto's zijn weg na cache wissen**
Foto's worden opnieuw geladen. Wacht even of ververs de app.`,
    keywords: ['cache', 'wissen', 'leegmaken', 'opruimen', 'tijdelijke bestanden', 'geheugen'],
    isFeatured: false,
    order: 3
  },
  {
    categorySlug: 'technische-hulp',
    title: 'The app is slow, how do I fix this?',
    titleNl: 'De app is traag, hoe los ik dit op?',
    slug: 'app-traag',
    excerpt: 'Tips om de app sneller te maken',
    content: 'How to speed up the app',
    contentNl: `# De app is traag, hoe los ik dit op?

Een trage app is frustrerend. Hier zijn oplossingen om de snelheid te verbeteren.

## Snelle oplossingen

### 1. Sluit andere apps
- Te veel open apps vertragen je telefoon
- Sluit apps die je niet gebruikt
- Herstart de telefoon voor een schone start

### 2. Check je internetverbinding
- Test je snelheid op speedtest.net
- Schakel over naar wifi (stabieler)
- Kom dichter bij je wifi-router

### 3. Wis de cache
Zie het artikel "Hoe wis ik de cache?" voor instructies.

### 4. Update de app
1. Ga naar App Store of Play Store
2. Zoek Liefde Voor Iedereen
3. Tik op "Update" als beschikbaar

## Geavanceerde oplossingen

### Opslagruimte vrijmaken
Een volle telefoon is een trage telefoon:
1. Verwijder apps die je niet gebruikt
2. Wis oude foto's en video's
3. Leeg je downloads-map
4. Streef naar minimaal 2GB vrije ruimte

### Achtergrond-apps beperken
#### iPhone:
1. Instellingen → Algemeen → Ververs op achtergrond
2. Schakel uit voor apps die je niet nodig hebt

#### Android:
1. Instellingen → Apps
2. Selecteer zware apps
3. Beperk achtergrondgebruik

### Animaties verminderen
#### iPhone:
1. Instellingen → Toegankelijkheid → Beweging
2. Zet "Verminder beweging" aan

#### Android:
1. Instellingen → Toegankelijkheid
2. Zoek "Animaties verwijderen" of vergelijkbaar

## Problemen per onderdeel

### Foto's laden langzaam
- Check je internetsnelheid
- Wis de cache
- Dit verbetert na eerste keer laden

### Swipen hapert
- Sluit andere apps
- Wis de cache
- Herstart de app

### Chat is traag
- Check je verbinding
- Ververs het gesprek
- Veel berichten? Scroll niet te ver terug

## Systeemvereisten

Voor de beste ervaring:

| | Minimum | Aanbevolen |
|-|---------|------------|
| **iOS** | iOS 13 | iOS 16+ |
| **Android** | Android 8 | Android 12+ |
| **RAM** | 2 GB | 4 GB+ |
| **Opslag** | 100 MB vrij | 500 MB+ vrij |

## Oudere telefoon?

Als je telefoon oud is:
- Overweeg de **website** te gebruiken in plaats van de app
- Houd je systeem up-to-date
- Beperk achtergrond-apps
- Overweeg een nieuwere telefoon

## Veelgestelde vragen

**Is de app traag voor iedereen of alleen voor mij?**
Check onze statuspagina of social media. Bij algemene problemen communiceren we daarover.

**Helpt een nieuwere telefoon?**
Vaak wel. Nieuwere telefoons hebben meer geheugen en snellere processors.

**De app was eerder snel, nu niet meer**
Probeer de app te verwijderen en opnieuw te installeren.`,
    keywords: ['traag', 'langzaam', 'snelheid', 'snel', 'hapert', 'laadt lang', 'performance'],
    isFeatured: false,
    order: 4
  }
]
