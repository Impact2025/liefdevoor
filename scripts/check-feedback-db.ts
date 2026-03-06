import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function main() {
  const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name ILIKE '%feedback%'`
  console.log('Feedback tables in DB:', tables.map((t: any) => t.table_name))

  const hasSurvey = tables.some((t: any) => t.table_name.toLowerCase() === 'feedbacksurvey' || t.table_name === 'FeedbackSurvey')
  if (hasSurvey) {
    const count = await sql`SELECT COUNT(*) as total FROM "FeedbackSurvey"`
    console.log('Responses:', count[0].total)
    if (Number(count[0].total) > 0) {
      const rows = await sql`SELECT * FROM "FeedbackSurvey" ORDER BY "createdAt" DESC`
      console.log(JSON.stringify(rows, null, 2))
    }
  } else {
    console.log('❌ FeedbackSurvey tabel bestaat NIET in de database')
  }
}

main().catch(console.error)
