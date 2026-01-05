/**
 * Migrate Static Blog Articles to Database
 *
 * This script migrates the hardcoded blog articles from lib/doelgroepen-data.ts
 * to the database so they can be managed via the /admin/blog interface.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const staticBlogs = [
  {
    slug: 'daten-zonder-masker',
    title: 'Daten zonder masker: Waarom je hier jezelf mag zijn',
    excerpt: 'Op veel dating apps voelt het alsof je een rol moet spelen. Wij geloven dat de beste relaties beginnen met eerlijkheid.',
    content: `
# Daten zonder masker

Op veel dating apps voelt het alsof je een rol moet spelen. Je foto's moeten perfect zijn, je bio moet grappig zijn, en je moet altijd snel en gevat reageren. Maar wat als dat niet jouw stijl is?

## Waarom eerlijkheid wint

De beste relaties beginnen niet met een perfect eerste indruk. Ze beginnen met echte connectie. Iemand die van je houdt om wie je écht bent, niet om wie je doet alsof je bent.

## Tips voor authentiek daten

1. **Schrijf je bio zoals je praat** - Geen marketingtaal, gewoon jij
2. **Gebruik recente foto's** - Beter een eerlijke foto dan teleurstelling bij de eerste date
3. **Wees open over wat je zoekt** - Serieus? Casual? Weet het nog niet? Prima, zeg het gewoon
4. **Neem de tijd** - Je hoeft niet binnen 5 minuten te reageren

## Het voordeel van neurodiversiteit in relaties

Veel mensen met autisme of ADHD zijn juist heel eerlijk en direct. In een wereld vol dating games is dat een verfrissende eigenschap. Omarm het.
    `,
    featuredImage: '/images/blog/daten-zonder-masker.jpg',
    tags: ['autisme', 'adhd', 'neurodiversiteit', 'authenticiteit', 'dating-tips'],
    readTime: 4,
    publishedAt: '2025-01-02',
    categoryName: 'Dating Tips'
  },
  {
    slug: 'veilig-daten-tips',
    title: 'Veilig daten doe je zo',
    excerpt: 'Hoe weet je of iemand te vertrouwen is? Wij leggen uit waar je op moet letten.',
    content: `
# Veilig daten doe je zo

Het is belangrijk om veilig te daten. Hier zijn tips die je helpen.

## Herken nepprofielen

- Foto lijkt te mooi? Pas op!
- Iemand vraagt snel om geld? Blokkeren!
- Wil iemand heel snel afspreken? Neem de tijd

## Eerste date tips

- Spreek af op een openbare plek
- Vertel een vriend waar je bent
- Ga niet mee naar huis bij de eerste date

## Wij passen op je

Alle profielen worden door ons gecontroleerd. Zie je iets raars? Meld het!
    `,
    featuredImage: '/images/blog/veilig-daten.jpg',
    tags: ['lvb', 'veilig', 'begeleiding', 'global', 'veiligheid', 'dating-tips'],
    readTime: 3,
    publishedAt: '2025-01-02',
    categoryName: 'Veiligheid'
  },
  {
    slug: 'liefde-is-blind',
    title: 'Liefde is blind, maar onze app niet',
    excerpt: 'Hoe wij dating toegankelijk maken voor slechtzienden en blinden.',
    content: `
# Liefde is blind, maar onze app niet

De meeste dating apps zijn visueel. Swipen op foto's, scannen van profielen - niet ideaal als je slechtziend of blind bent.

## Wat wij anders doen

### Audio Profielen
Elk lid kan een stemintroductie opnemen. Hoor hoe iemand klinkt, niet alleen hoe ze eruitzien.

### Screenreader Support
Onze app werkt naadloos met VoiceOver, TalkBack en NVDA. Elke knop heeft een duidelijk label.

### Hoog Contrast Modus
Voor slechtzienden: extra grote tekst en maximaal contrast.

## Persoonlijkheid boven uiterlijk

Is dat eigenlijk niet hoe dating zou moeten zijn? Verliefd worden op wie iemand is, niet alleen op hoe ze eruitzien.
    `,
    featuredImage: '/images/blog/liefde-is-blind.jpg',
    tags: ['slechtziend', 'blind', 'visueel', 'toegankelijk', 'toegankelijkheid'],
    readTime: 5,
    publishedAt: '2025-01-02',
    categoryName: 'Dating Tips'
  },
  {
    slug: 'onze-missie',
    title: 'Liefde Voor Iedereen: Onze missie en belofte',
    excerpt: 'Waarom wij geloven dat liefde er voor iedereen is, ongeacht je achtergrond of situatie.',
    content: `
# Liefde Voor Iedereen

## Onze missie

Wij geloven dat iedereen liefde verdient. Of je nu neurodiverste bent, een beperking hebt, of gewoon moe bent van oppervlakkige dating apps - er is een plek voor je.

## Wat ons anders maakt

- **Geen swipen** - We geloven in kwaliteit boven kwantiteit
- **Toegankelijkheid** - Onze app werkt voor iedereen
- **Veiligheid** - Elk profiel wordt gecontroleerd
- **Nederlandse service** - Echte mensen, geen bots

## Onze belofte

We behandelen je met respect. Je data verkopen we niet. En we blijven luisteren naar wat jij nodig hebt.
    `,
    featuredImage: '/images/blog/onze-missie.jpg',
    tags: ['global', 'missie', 'over-ons'],
    readTime: 4,
    publishedAt: '2025-01-01',
    categoryName: 'Succesverhalen'
  }
]

async function main() {
  console.log('🚀 Starting blog migration...')

  // Get or create categories
  const categoryMap: Record<string, string> = {}

  for (const blog of staticBlogs) {
    // Find or create category
    let category = await prisma.category.findFirst({
      where: { name: blog.categoryName }
    })

    if (!category) {
      console.log(`📁 Creating category: ${blog.categoryName}`)
      category = await prisma.category.create({
        data: {
          name: blog.categoryName,
          icon: blog.categoryName === 'Dating Tips' ? '💡' :
                blog.categoryName === 'Veiligheid' ? '🛡️' :
                blog.categoryName === 'Succesverhalen' ? '❤️' : '📝',
          color: blog.categoryName === 'Dating Tips' ? '#ec4899' :
                 blog.categoryName === 'Veiligheid' ? '#10b981' :
                 blog.categoryName === 'Succesverhalen' ? '#f59e0b' : '#8b5cf6'
        }
      })
    }

    categoryMap[blog.categoryName] = category.id

    // Check if post already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug: blog.slug }
    })

    if (existingPost) {
      console.log(`⏭️  Skipping "${blog.title}" - already exists`)
      continue
    }

    // Get admin user (first admin in the system)
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminUser) {
      console.error('❌ No admin user found! Please create an admin user first.')
      process.exit(1)
    }

    // Create blog post
    console.log(`✅ Migrating: "${blog.title}"`)
    await prisma.post.create({
      data: {
        title: blog.title,
        slug: blog.slug,
        content: blog.content.trim(),
        excerpt: blog.excerpt,
        featuredImage: blog.featuredImage,
        published: true,
        publishedAt: new Date(blog.publishedAt),
        categoryId: categoryMap[blog.categoryName],
        authorId: adminUser.id,
        keywords: blog.tags,
        seoTitle: blog.title,
        seoDescription: blog.excerpt,
        aiOptimized: false // These are manually written, not AI optimized
      }
    })
  }

  console.log('✨ Migration complete!')
  console.log(`📊 Migrated ${staticBlogs.length} blog posts`)
  console.log('💡 You can now manage these posts at /admin/blog')
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
