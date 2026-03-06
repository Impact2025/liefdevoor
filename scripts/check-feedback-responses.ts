/**
 * Check feedback survey responses
 */
import { prisma } from '@/lib/prisma'

async function main() {
  // Check available models
  const models = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$'))
  const hasFeedback = models.some(m => m.toLowerCase().includes('feedback'))
  console.log('Models with "feedback":', models.filter(m => m.toLowerCase().includes('feedback')))

  // Try raw query to check if FeedbackSurvey table exists
  const tables = await prisma.$queryRaw<any[]>`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name ILIKE '%feedback%'
    ORDER BY table_name
  `
  console.log('\nFeedback tabellen in database:', tables.map((t: any) => t.table_name))

  // Try to query FeedbackSurvey directly
  try {
    const count = await prisma.$queryRaw<any[]>`SELECT COUNT(*) as total FROM "FeedbackSurvey"`
    console.log(`\n📊 Aantal feedback responses: ${count[0].total}`)

    if (Number(count[0].total) > 0) {
      const rows = await prisma.$queryRaw<any[]>`SELECT * FROM "FeedbackSurvey" ORDER BY "createdAt" DESC`
      console.log('\n=== RESPONSES ===')
      for (const r of rows) {
        console.log(`\nDatum: ${new Date(r.createdAt).toLocaleDateString('nl-NL')}`)
        console.log(`NPS: ${r.wouldRecommend ?? '-'}`)
        console.log(`Tevredenheid: ${r.satisfaction ?? '-'}/5`)
        console.log(`Gebruiksgemak: ${r.easeOfUse ?? '-'}/5`)
        console.log(`Design: ${r.designRating ?? '-'}/5`)
        if (r.bestFeature) console.log(`Beste feature: ${r.bestFeature}`)
        if (r.missingFeatures) console.log(`Mist: ${JSON.stringify(r.missingFeatures)}`)
        if (r.improvements) console.log(`Verbeterpunten: ${r.improvements}`)
      }
    }
  } catch (e: any) {
    console.log(`\n❌ FeedbackSurvey tabel bestaat NIET: ${e.message?.split('\n')[0]}`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
