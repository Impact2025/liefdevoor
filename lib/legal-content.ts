/**
 * Legal Content
 * Centralized storage for Privacy Policy, Cookie Policy, and Terms content
 * Maakt het makkelijk om legal teksten bij te werken zonder components aan te passen
 */

export const CURRENT_DATE = new Date().toLocaleDateString('nl-NL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export const PRIVACY_POLICY_VERSION = '2.0'

export const privacyPolicyContent = {
  title: 'Privacy policy – Liefde Voor Iedereen',
  effectiveDate: CURRENT_DATE,
  version: PRIVACY_POLICY_VERSION,

  sections: [
    {
      title: '1. Inleiding',
      content: `Bij Liefde Voor Iedereen ("wij", "ons", "het Platform") is uw privacy geen bijzaak, maar de kern van ons product. Omdat wij mensen samenbrengen, verwerken wij persoonlijke en soms intieme gegevens. Wij nemen de verantwoordelijkheid om deze data te beschermen uiterst serieus.

Deze Privacy policy beschrijft hoe wij uw gegevens verzamelen, gebruiken en beveiligen via onze website en Progressive Web App (PWA), in overeenstemming met de Algemene Verordening Gegevensbescherming (AVG).`,
    },
    {
      title: '2. Welke gegevens wij verzamelen',
      content: `Om onze matching-services en AI-functies te kunnen leveren, verwerken wij de volgende categorieën persoonsgegevens:`,
      subsections: [
        {
          title: '2.1. Account- en identificatiegegevens',
          items: [
            'Registratie: E-mailadres, wachtwoord (gehasht opgeslagen), en geboortedatum (voor 18+ validatie).',
            'Verificatie: Indien u kiest voor profielverificatie, verwerken wij een real-time foto om deze te vergelijken met uw profielfoto\'s (biometrische data).',
          ],
        },
        {
          title: '2.2. Profiel- en matchingsgegevens',
          items: [
            'Zichtbaar profiel: Foto\'s, bio, gesproken introducties (voice), interesses en geslacht.',
            'Zoekvoorkeuren: Leeftijdsbereik, locatie-radius en gender-voorkeuren.',
            'Interacties: Uw swipe-gedrag (likes/passes), chatgeschiedenis en gematchte contacten.',
          ],
        },
        {
          title: '2.3. Locatiegegevens',
          content: `Wij gebruiken uw geolocatie (GPS-coördinaten) en postcodes om de afstand tot andere gebruikers te berekenen via de Haversine-formule. U kunt deze toestemming te allen tijde intrekken via uw apparaatinstellingen.`,
        },
        {
          title: '2.4. Technische en apparaatgegevens',
          content: `IP-adres, device type, besturingssysteem en logs van app-prestaties (via Sentry) om fouten op te sporen en beveiliging te garanderen.`,
        },
      ],
    },
    {
      title: '3. Doeleinden en grondslagen voor verwerking',
      content: `Wij verwerken uw gegevens uitsluitend op basis van wettelijke grondslagen:`,
      table: {
        headers: ['Doel', 'Data categorie', 'Grondslag (AVG)'],
        rows: [
          [
            'Dienstverlening (Accounts beheren, matches tonen)',
            'Account, Profiel, Locatie',
            'Uitvoering overeenkomst',
          ],
          [
            'Betalingen (Abonnementen verwerken)',
            'Betaalgegevens',
            'Uitvoering overeenkomst',
          ],
          [
            'Veiligheid (Safety score, blokkades, fraude detectie)',
            'Interacties, IP, Chatlogs',
            'Gerechtvaardigd belang',
          ],
          [
            'AI suggesties (Icebreakers genereren)',
            'Profiel, Interesses',
            'Toestemming',
          ],
          [
            'Marketing (Nieuwsbrieven, updates)',
            'E-mailadres',
            'Toestemming',
          ],
        ],
      },
      note: `**Noot over bijzondere persoonsgegevens**: Door het gebruik van een datingapp maakt u gegevens openbaar die uw seksuele geaardheid kunnen onthullen. Door deze gegevens op uw profiel te plaatsen, geeft u uitdrukkelijk toestemming voor de verwerking hiervan voor matching-doeleinden.`,
    },
    {
      title: '4. Gebruik van artificial intelligence (AI)',
      content: `Ons platform maakt gebruik van geavanceerde AI om uw ervaring te verbeteren. Wij zijn hier volledig transparant over:`,
      items: [
        '**Icebreakers (OpenRouter/Claude AI)**: Wanneer u om een gesprekssuggestie vraagt, sturen wij geanonimiseerde context (bijv. "Gebruiker houdt van wandelen") naar onze AI-partner OpenRouter. Uw privégesprekken worden nooit gebruikt om publieke AI-modellen te trainen.',
        '**Safety & moderatie**: Wij gebruiken geautomatiseerde algoritmes om uw "Safety score" te bepalen op basis van gedrag (zoals gerapporteerde berichten of spam-gedrag) om de community veilig te houden.',
      ],
    },
    {
      title: '5. Delen van gegevens met derden',
      content: `Wij verkopen uw data nooit. Wij delen gegevens uitsluitend met strikt noodzakelijke serviceproviders ("Verwerkers") die voldoen aan strenge beveiligingseisen:`,
      items: [
        '**Hosting & infrastructuur**: Vercel (Deployment) en Neon/AWS (Database) voor veilige data-opslag.',
        '**Media opslag**: UploadThing voor het veilig opslaan en verwerken van uw foto\'s en audio.',
        '**Betalingen**: Multisafepay voor het verwerken van transacties (wij slaan zelf geen creditcardgegevens op).',
        '**AI services**: OpenRouter voor het genereren van tekstsuggesties.',
        '**Monitoring**: Sentry voor het opsporen van technische fouten.',
      ],
    },
    {
      title: '6. Beveiliging van uw gegevens',
      content: `Wij hanteren een "Security by design" aanpak om uw gegevens te beschermen:`,
      items: [
        '**Encryptie**: Alle data in transit (tijdens verzending) en at rest (in de database) is versleuteld.',
        '**Toegangscontrole**: Rate limiting, CSRF-protectie en strikte authenticatie-protocollen.',
        '**Audit logging**: Interne toegang tot data door admins wordt gelogd en gemonitord.',
      ],
    },
    {
      title: '7. Bewaartermijnen',
      content: `Wij bewaren uw gegevens niet langer dan noodzakelijk:`,
      items: [
        '**Actieve accounts**: Zolang uw account bestaat.',
        '**Verwijderde accounts**: Na verwijdering worden uw profielgegevens direct ontoegankelijk gemaakt en binnen 30 dagen definitief gewist uit onze primaire database en back-ups.',
        '**Inactiviteit**: Accounts die langdurig inactief zijn, kunnen na notificatie worden verwijderd.',
      ],
    },
    {
      title: '8. Uw rechten',
      content: `U heeft conform de AVG de volgende rechten:`,
      items: [
        '**Inzage & export**: U kunt een kopie opvragen van alle data die wij van u hebben.',
        '**Correctie & verwijdering**: U kunt gegevens aanpassen of uw volledige account ("Recht op vergetelheid") verwijderen via de app-instellingen.',
        '**Intrekken toestemming**: U kunt toestemming voor locatiebepaling of marketing op elk moment intrekken.',
        '**Bezwaar**: U kunt bezwaar maken tegen verwerking op basis van gerechtvaardigd belang.',
        '**Dataportabiliteit**: U kunt uw gegevens in een gestructureerd, machineleesbaar formaat opvragen.',
      ],
      note: `Om uw rechten uit te oefenen, ga naar **Instellingen > Privacy** in de app of neem contact met ons op via privacy@liefdevooriederen.nl.`,
    },
  ],
}

export const cookiePolicyContent = {
  title: 'Cookieverklaring – Liefde Voor Iedereen',
  lastModified: CURRENT_DATE,

  intro: {
    title: '1. Wat zijn cookies?',
    content: `Cookies zijn kleine tekstbestanden die op uw apparaat (computer, smartphone of tablet) worden opgeslagen wanneer u onze website of app bezoekt. Ze zorgen ervoor dat de app soepel functioneert, onthouden uw voorkeuren en helpen ons om inzicht te krijgen in het gebruik van het platform.`,
  },

  categories: [
    {
      title: '2.1. Strikt noodzakelijke cookies (functioneel)',
      description: `Deze cookies zijn onmisbaar voor de werking van het platform. Zonder deze cookies kunt u niet inloggen of veilig betalen. U kunt deze niet uitschakelen.`,
      cookies: [
        {
          name: 'next-auth.session-token',
          provider: 'Liefde Voor Iedereen',
          purpose: 'Beheert uw actieve inlogsessie en houdt u ingelogd.',
          duration: 'Sessie',
        },
        {
          name: '__Host-next-auth.csrf-token',
          provider: 'Liefde Voor Iedereen',
          purpose:
            'Beschermt tegen CSRF-aanvallen (Cross-Site Request Forgery) om uw account veilig te houden.',
          duration: 'Sessie',
        },
        {
          name: 'cookie-consent',
          provider: 'Liefde Voor Iedereen',
          purpose: 'Onthoudt uw keuze in de cookiebanner.',
          duration: '1 jaar',
        },
      ],
    },
    {
      title: '2.2. Analytische en prestatie cookies',
      description: `Deze cookies helpen ons begrijpen hoe het platform wordt gebruikt, zodat wij fouten kunnen opsporen en de gebruikerservaring kunnen verbeteren. Omdat wij deze gegevens anonimiseren, hebben deze weinig impact op uw privacy.`,
      cookies: [
        {
          name: '_ga',
          provider: 'Google Analytics',
          purpose:
            'Onderscheidt unieke gebruikers en meet websitegebruik. IP-adressen worden geanonimiseerd.',
          duration: '2 jaar',
        },
        {
          name: '_ga_*',
          provider: 'Google Analytics',
          purpose:
            'Gebruikt om sessies bij te houden en gebruikersgedrag te analyseren.',
          duration: '2 jaar',
        },
        {
          name: 'sentry-sc / sentry-sid',
          provider: 'Sentry.io',
          purpose:
            'Traceert technische fouten en crashes in real-time, zodat onze developers deze kunnen oplossen.',
          duration: 'Sessie',
        },
        {
          name: 'analytics_events',
          provider: 'Liefde Voor Iedereen',
          purpose:
            'Interne meting van gebruikersinteractie (zoals swipes en clicks) om de app te optimaliseren.',
          duration: '1 jaar',
        },
      ],
    },
    {
      title: '2.3. Marketing en tracking cookies',
      description: `Wij gebruiken deze cookies om onze marketingcampagnes te meten. Wij vragen hier altijd vooraf uw toestemming voor.`,
      cookies: [
        {
          name: 'msp_session',
          provider: 'Multisafepay',
          purpose:
            'Kan worden geplaatst tijdens het afrekenproces van een Premium/Gold abonnement voor fraudepreventie.',
          duration: 'Sessie',
        },
      ],
    },
  ],

  management: {
    title: '3. Cookiebeheer',
    content: `U kunt uw cookievoorkeuren op elk moment wijzigen via de instellingen in uw profiel of via de link "Cookie instellingen" onderaan de website. Daarnaast kunt u via uw browserinstellingen alle geplaatste cookies verwijderen.`,
  },
}

export const termsContent = {
  title: 'Algemene Voorwaarden – Liefde Voor Iedereen',
  effectiveDate: CURRENT_DATE,
  version: '1.0',

  intro: `Deze Algemene Voorwaarden zijn van toepassing op het gebruik van de diensten van Liefde Voor Iedereen. Door gebruik te maken van onze diensten, gaat u akkoord met deze voorwaarden.`,

  sections: [
    {
      title: '1. Definities',
      content: `In deze algemene voorwaarden wordt verstaan onder:
- **Platform**: De website en Progressive Web App (PWA) van Liefde Voor Iedereen
- **Gebruiker**: Iedere natuurlijke persoon die gebruik maakt van het Platform
- **Diensten**: Alle functionaliteiten en services die via het Platform worden aangeboden`,
    },
    {
      title: '2. Toepasselijkheid',
      content: `Deze algemene voorwaarden zijn van toepassing op alle overeenkomsten tussen Liefde Voor Iedereen en Gebruikers. Door een account aan te maken of gebruik te maken van onze diensten, verklaart u akkoord te gaan met deze voorwaarden.`,
    },
    {
      title: '3. Accountregistratie',
      items: [
        'U moet minimaal 18 jaar oud zijn om een account aan te maken.',
        'U bent verantwoordelijk voor het vertrouwelijk houden van uw inloggegevens.',
        'U mag slechts één account aanmaken.',
        'U bent verantwoordelijk voor alle activiteiten die via uw account plaatsvinden.',
      ],
    },
    {
      title: '4. Gebruik van de diensten',
      content: `U verplicht zich om:`,
      items: [
        'Geen valse informatie te verstrekken',
        'Respectvol om te gaan met andere gebruikers',
        'Geen spam of ongepaste berichten te versturen',
        'Geen illegale activiteiten uit te voeren via het Platform',
        'Zich te houden aan onze Community Guidelines',
      ],
    },
    {
      title: '5. Intellectueel eigendom',
      content: `Alle rechten van intellectueel eigendom met betrekking tot het Platform berusten bij Liefde Voor Iedereen. Het is niet toegestaan om zonder toestemming content te kopiëren of te verspreiden.`,
    },
    {
      title: '6. Aansprakelijkheid',
      content: `Liefde Voor Iedereen is niet aansprakelijk voor:`,
      items: [
        'Schade als gevolg van onjuiste informatie door gebruikers',
        'Indirecte schade of gevolgschade',
        'Gedrag van andere gebruikers',
        'Onderbreking of beëindiging van de dienst',
      ],
    },
    {
      title: '7. Beëindiging',
      content: `U kunt uw account op elk moment verwijderen via de instellingen. Wij behouden ons het recht voor om accounts te blokkeren of te verwijderen bij schending van deze voorwaarden.`,
    },
    {
      title: '8. Wijzigingen',
      content: `Wij behouden ons het recht voor om deze algemene voorwaarden te wijzigen. Wijzigingen worden van kracht na publicatie op het Platform. Wij zullen u hiervan op de hoogte stellen.`,
    },
    {
      title: '9. Contact',
      content: `Voor vragen over deze algemene voorwaarden kunt u contact opnemen via:
- E-mail: info@liefdevooriederen.nl
- Adres: [Bedrijfsadres]`,
    },
  ],
}
