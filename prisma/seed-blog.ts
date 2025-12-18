import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding blog content...')

  // Create categories
  const categories = [
    { name: 'Date Tips', icon: '💡', color: '#FF6B6B', description: 'Praktische tips voor succesvolle dates' },
    { name: 'Relatie Advies', icon: '💕', color: '#4ECDC4', description: 'Inzichten over relaties en liefde' },
    { name: 'Dating Stories', icon: '📖', color: '#45B7D1', description: 'Persoonlijke verhalen van onze community' },
    { name: 'Lifestyle', icon: '🌟', color: '#96CEB4', description: 'Levensstijl tips voor singles' },
    { name: 'Psychologie', icon: '🧠', color: '#FFEAA7', description: 'Wetenschappelijke inzichten over liefde' }
  ]

  await prisma.category.createMany({
    data: categories,
    skipDuplicates: true
  })

  // Get or create admin user
  let adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (!adminUser) {
    console.log('📝 Creating admin user...')
    adminUser = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@liefdevooriedereen.nl',
        passwordHash: '$2a$10$dummy.hash.for.admin', // This will be replaced with proper hash
        role: 'ADMIN',
        isVerified: true,
        safetyScore: 100,
        hasAcceptedTerms: true
      }
    })
    console.log('✅ Admin user created')
  }

  // Get categories
  const dateTipsCat = await prisma.category.findFirst({ where: { name: 'Date Tips' } })
  const relatieAdviesCat = await prisma.category.findFirst({ where: { name: 'Relatie Advies' } })
  const datingStoriesCat = await prisma.category.findFirst({ where: { name: 'Dating Stories' } })
  const lifestyleCat = await prisma.category.findFirst({ where: { name: 'Lifestyle' } })
  const psychologieCat = await prisma.category.findFirst({ where: { name: 'Psychologie' } })

  // Create sample posts
  const posts = [
    {
      title: '10 Onmisbare Date Tips voor Beginners',
      content: `# 10 Onmisbare Date Tips voor Beginners

Daten kan spannend zijn, vooral als je net begint. Hier zijn 10 praktische tips die je helpen om zelfverzekerd en relaxed op date te gaan.

## 1. Wees jezelf
Het belangrijkste advies: wees authentiek. Niemand valt voor een masker dat je draagt.

## 2. Luister actief
Stel vragen en toon oprechte interesse in wat je date vertelt. Goede gesprekken zijn tweerichtingsverkeer.

## 3. Kies een geschikte locatie
Kies een plek waar jullie comfortabel kunnen praten. Een café of restaurant is vaak een goede keuze.

## 4. Houd het licht
Vermijd zware onderwerpen tijdens de eerste date. Focus op leuke, luchtige gesprekken.

## 5. Wees op tijd
Punctualiteit toont respect voor de ander. Kom een paar minuten eerder aan.

## 6. Dress to impress
Kleed je netjes aan, maar blijf dicht bij je eigen stijl. Comfort is belangrijk.

## 7. Gebruik je telefoon verstandig
Leg je telefoon weg tijdens het gesprek. Niets is zo onbeleefd als constant op je scherm kijken.

## 8. Wees positief
Een positieve houding is aantrekkelijk. Focus op de leuke aspecten van het leven.

## 9. Stel follow-up vragen
Als de date goed gaat, stel dan voor om elkaar nog eens te zien.

## 10. Leer van elke ervaring
Elke date is een leermoment. Reflecteer wat goed ging en wat beter kan.

Onthoud: dating is een proces. Niet elke date leidt tot een relatie, maar elke date brengt je dichter bij de persoon die perfect bij je past.`,
      excerpt: 'Praktische tips voor iedereen die net begint met daten. Leer hoe je zelfverzekerd en relaxed op date gaat.',
      featuredImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
      categoryId: dateTipsCat!.id,
      published: true
    },
    {
      title: 'Waarom Liefde op het Werk Risicovol Is',
      content: `# Waarom Liefde op het Werk Risicovol Is

Office romance lijkt opwindend, maar brengt vaak meer complicaties dan voordelen. Hieronder bespreken we de belangrijkste risico's en hoe je ze kunt vermijden.

## Professionele consequenties
Wanneer een relatie eindigt, kan dit leiden tot een ongemakkelijke werksituatie. Collega blijven werken met je ex is vaak lastig.

## Machtsongelijkheid
Als een van de partners hoger in de hiërarchie staat, kan dit leiden tot beschuldigingen van misbruik van positie.

## Productiviteitsverlies
Relaties op het werk kunnen leiden tot afleiding en verminderde concentratie.

## Bedrijfsbeleid
Veel bedrijven hebben strikte regels over relaties tussen collega's.

## Alternatieven
In plaats van een collega, overweeg om mensen te ontmoeten buiten je werkomgeving. Dating apps bieden talloze mogelijkheden.

## Wanneer het wel werkt
Sommige stellen slagen erin om werk en privé gescheiden te houden. Dit vereist echter veel discipline en duidelijke afspraken.

## Advies
Als je toch gevoelens ontwikkelt voor een collega, neem dan afstand en overweeg je opties zorgvuldig. Je carrière is belangrijk.`,
      excerpt: 'De risico\'s van romantiek op de werkvloer en waarom het vaak beter is om werk en privé gescheiden te houden.',
      featuredImage: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=800',
      categoryId: relatieAdviesCat!.id,
      published: true
    },
    {
      title: 'Mijn Reis van Single naar Gelukkig Getrouwd',
      content: `# Mijn Reis van Single naar Gelukkig Getrouwd

Mijn verhaal begon 5 jaar geleden toen ik besloot om serieus op zoek te gaan naar mijn soulmate. Hier deel ik mijn ervaringen en lessen.

## Het begin
Na een lange relatie van 8 jaar stond ik plotseling alleen. Ik was 32 en had geen idee hoe ik moest daten in de moderne wereld.

## Online dating
Ik downloadde verschillende apps en begon met swipen. De eerste maanden waren ontmoedigend - veel oppervlakkige gesprekken en weinig klik.

## De omslag
Ik besefte dat ik mijn verwachtingen moest bijstellen. In plaats van te zoeken naar "de perfecte persoon", begon ik te genieten van de ontmoetingen.

## De ontmoeting
Op een regenachtige zaterdag ontmoette ik Mark tijdens een speed dating event. Hij was anders dan iedereen die ik eerder had ontmoet.

## De relatie
Onze eerste date duurde 6 uur. We praatten over alles en lachten veel. Een week later hadden we onze tweede date.

## Het huwelijk
Na 2 jaar daten vroeg Mark me ten huwelijk tijdens een weekendje weg. Een jaar later gaven we elkaar het jawoord.

## Lessen geleerd
1. Wees geduldig - liefde vindt je wanneer je er klaar voor bent
2. Wees jezelf - authenticiteit trekt de juiste mensen aan
3. Stel duidelijke grenzen
4. Investeer tijd in zelfontwikkeling
5. Geniet van het proces

## Advies voor anderen
Geef niet op als het even niet lukt. De juiste persoon komt op het juiste moment. Focus op jezelf en je geluk.`,
      excerpt: 'Een persoonlijke reis van teleurstelling naar ware liefde. Leer van mijn ervaringen in de wereld van online dating.',
      featuredImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800',
      categoryId: datingStoriesCat!.id,
      published: true
    },
    {
      title: 'Wetenschap Achter Liefde op het Eerste Gezicht',
      content: `# Wetenschap Achter Liefde op het Eerste Gezicht

"Liefde op het eerste gezicht" is meer dan een romantisch cliché. Wetenschappelijk onderzoek toont aan dat er neurologische processen plaatsvinden die dit fenomeen verklaren.

## Het brein en aantrekkingskracht
Wanneer we iemand aantrekkelijk vinden, activeert ons brein het beloningssysteem. Dopamine en norepinefrine worden vrijgegeven.

## Visuele cues
Onze hersenen verwerken visuele informatie in milliseconden. Symmetrie, lichaamstaal en gelaatsexpressies spelen een cruciale rol.

## Geur en feromonen
Onderbewustzijn reageren we op feromonen. Deze chemische signalen beïnvloeden onze aantrekkingskracht.

## Sociale conditionering
Onze opvoeding en ervaringen vormen onze voorkeuren. Wat we als "liefde op het eerste gezicht" ervaren, is vaak een combinatie van biologie en geleerde patronen.

## Kan het duurzaam zijn?
Hoewel de eerste indruk belangrijk is, is het geen garantie voor een succesvolle relatie. Diepe connectie vereist tijd en gedeelde waarden.

## Praktische tips
- Vertrouw op je intuïtie, maar neem de tijd om iemand echt te leren kennen
- Let op lichaamstaal en non-verbale signalen
- Wees open-minded over verschillende soorten aantrekkingskracht

De wetenschap bevestigt dat eerste indrukken belangrijk zijn, maar ware liefde gaat dieper dan oppervlakkige aantrekkingskracht.`,
      excerpt: 'Neurologisch onderzoek onthult wat er gebeurt in ons brein tijdens "liefde op het eerste gezicht".',
      featuredImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&q=80&w=800',
      categoryId: psychologieCat!.id,
      published: true
    },
    {
      title: 'Fitness Tips voor Singles: Blijf in Shape Tijdens het Daten',
      content: `# Fitness Tips voor Singles: Blijf in Shape Tijdens het Daten

Een gezonde levensstijl is aantrekkelijk en boost je zelfvertrouwen. Hier zijn praktische tips om fit te blijven tijdens het daten.

## Waarom fitness belangrijk is
Regelmatige beweging:
- Verbetert je humeur
- Verhoogt energie levels
- Maakt je aantrekkelijker
- Reduceert stress

## Praktische oefeningen
Je hoeft geen duur fitness abonnement te hebben. Thuis workouts zijn effectief:

### Cardio
- 30 minuten joggen in het park
- Dansen op je favoriete muziek
- Springtouw oefeningen

### Krachttraining
- Push-ups (begin met knieën op de grond)
- Squats
- Planks (start met 20 seconden)

### Yoga
- Ademhalingsoefeningen voor stressvermindering
- Stretching voor flexibiliteit
- Meditatie voor mentale helderheid

## Dieet tips
- Eet gebalanceerd: veel groenten, mager eiwit, gezonde vetten
- Blijf gehydrateerd
- Beperk suiker en bewerkte voedingsmiddelen
- Eet bewust, niet emotioneel

## Motivatie behouden
- Stel realistische doelen
- Vier kleine overwinningen
- Zoek een workout buddy
- Maak het leuk - combineer met hobby's

## Date-proof workouts
Kies oefeningen die je energie geven zonder dat je er bezweet uitziet:
- Ochtend yoga
- Avond wandelingen
- Zwemmen
- Fietsen

Onthoud: consistentie is belangrijker dan perfectie. Kleine veranderingen leiden tot grote resultaten.`,
      excerpt: 'Blijf fit en aantrekkelijk tijdens het daten met deze praktische fitness tips voor drukke singles.',
      featuredImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=800',
      categoryId: lifestyleCat!.id,
      published: true
    }
  ]

  for (const postData of posts) {
    const slug = postData.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    await prisma.post.upsert({
      where: { slug },
      update: {},
      create: {
        ...postData,
        slug,
        authorId: adminUser.id
      }
    })
  }

  console.log('✅ Blog content seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })