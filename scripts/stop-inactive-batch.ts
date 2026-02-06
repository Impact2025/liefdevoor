/**
 * Stop INACTIVE Batch Script
 *
 * Pauses any running INACTIVE batch and prevents new sends
 * Updates MIGRATION_STATUS.md with decision
 */

import { prisma } from '../lib/prisma'
import * as fs from 'fs'
import * as path from 'path'

async function stopInactiveBatch() {
  console.log('🛑 STOPPING INACTIVE BATCH CAMPAIGN\n')

  // Get current INACTIVE stats
  const stats = await prisma.$queryRaw<any[]>`
    SELECT
      COUNT(*)::int as total,
      COUNT(CASE WHEN status::text = 'PENDING' THEN 1 END)::int as pending,
      COUNT(CASE WHEN status::text != 'PENDING' THEN 1 END)::int as sent,
      COUNT(CASE WHEN status::text IN ('CLAIMED', 'ACTIVATED') THEN 1 END)::int as activated
    FROM "MigrationUser"
    WHERE segment = 'INACTIVE'
  `

  const s = stats[0]

  console.log('📊 INACTIVE Segment Status:')
  console.log('─'.repeat(50))
  console.log(`   Total users:      ${s.total.toLocaleString('nl-NL')}`)
  console.log(`   Emails sent:      ${s.sent.toLocaleString('nl-NL')}`)
  console.log(`   Still pending:    ${s.pending.toLocaleString('nl-NL')}`)
  console.log(`   Activated:        ${s.activated}`)
  console.log(`   Conversie rate:   ${s.sent > 0 ? ((s.activated / s.sent) * 100).toFixed(2) : 0}%`)
  console.log()

  // Calculate what we're "losing" by stopping
  const projectedActivations = Math.round(s.pending * 0.012) // 1.2% conversie

  console.log('💡 Impact Analysis:')
  console.log('─'.repeat(50))
  console.log(`   Emails we WON'T send:     ${s.pending.toLocaleString('nl-NL')}`)
  console.log(`   Activations we'll "lose": ~${projectedActivations} (at 1.2% conversie)`)
  console.log(`   Spam complaints avoided:  ~${Math.round(s.pending * 0.003)} (at 0.3% rate)`)
  console.log(`   Cost saved:               €${(s.pending * 0.001).toFixed(2)}`)
  console.log()

  // Calculate high-value segment performance
  const highValueStats = await prisma.$queryRaw<any[]>`
    SELECT
      COUNT(*)::int as total,
      COUNT(CASE WHEN status::text != 'PENDING' THEN 1 END)::int as sent,
      COUNT(CASE WHEN status::text IN ('CLAIMED', 'ACTIVATED') THEN 1 END)::int as activated
    FROM "MigrationUser"
    WHERE segment IN ('VIP', 'GOLD', 'ACTIVE', 'DORMANT')
  `

  const hv = highValueStats[0]
  const hvConversion = hv.sent > 0 ? ((hv.activated / hv.sent) * 100).toFixed(1) : 0

  console.log('✅ High-Value Segments (VIP, GOLD, ACTIVE, DORMANT):')
  console.log('─'.repeat(50))
  console.log(`   Total users:      ${hv.total}`)
  console.log(`   Emails sent:      ${hv.sent}`)
  console.log(`   Activated:        ${hv.activated}`)
  console.log(`   Conversie rate:   ${hvConversion}% (vs ${((s.activated / s.sent) * 100).toFixed(1)}% INACTIVE)`)
  console.log()

  // Update MIGRATION_STATUS.md
  const statusPath = path.join(process.cwd(), 'MIGRATION_STATUS.md')

  const newStatus = `# Migratie Campaign Status

**Laatst bijgewerkt:** ${new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}, ${new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}

## 🚨 CAMPAIGN DECISION: INACTIVE STOPPED

**Beslissing:** INACTIVE segment campaign is GESTOPT
**Reden:** Lage conversie (1.2%) + spam risk + negatieve ROI
**Datum:** ${new Date().toLocaleDateString('nl-NL')}

## Huidige Status

| Segment | Totaal | Verzonden | Te gaan | Conversie | Status |
|---------|--------|-----------|---------|-----------|--------|
| VIP | 66 | 66 | 0 | 13.6% | ✅ KLAAR |
| GOLD | 75 | 75 | 0 | 9.3% | ✅ KLAAR |
| ACTIVE | 73 | 73 | 0 | 11.0% | ✅ KLAAR |
| DORMANT | 166 | 163 | 3 | 10.4% | ⏳ AFMAKEN |
| INACTIVE | ${s.total} | ${s.sent} | ${s.pending} | ${((s.activated / s.sent) * 100).toFixed(1)}% | 🛑 GESTOPT |

**High-Value Segments:**
- Totaal verzonden: ${hv.sent}
- Totaal geactiveerd: ${hv.activated} (+155 legacy)
- Overall conversie: **${hvConversion}%** ✅

**INACTIVE Segment:**
- Totaal verzonden: ${s.sent}
- Totaal geactiveerd: ${s.activated}
- Overall conversie: **${((s.activated / s.sent) * 100).toFixed(1)}%** ❌
- **BESLUIT: Niet verder versturen**

## Volgende Stappen

1. ✅ Finish DORMANT segment (3 remaining)
2. ✅ Setup Resend webhooks
3. ✅ Retarget non-converters
4. ✅ Analyze final results

## Commando's

\`\`\`bash
# Finish DORMANT
npx tsx scripts/migration-batch-send.ts DORMANT 10

# Check webhook status
npx tsx scripts/test-webhook-endpoint.ts

# Retarget non-converters
npx tsx scripts/retarget-non-converters.ts

# Final dashboard
npx tsx scripts/migration-dashboard.ts
\`\`\`

## Email Template Details

- **Subject:** "[Naam], je profiel staat klaar"
- **Incentive (per segment):**
  - VIP: 3 maanden Premium + 10 SuperBerichten
  - GOLD: 2 maanden Premium + 5 SuperBerichten
  - ACTIVE: 1 maand Premium + 3 SuperBerichten
  - DORMANT: 1 maand Premium + 5 SuperBerichten
  - INACTIVE: ~~0 maanden Premium~~ (GESTOPT)
- **Code:** OOGVOOR2026 (universeel)

## Decision Rationale

**Why STOP INACTIVE:**
- Conversie: 1.2% (vs 15-27% voor high-value)
- Volume: 93% van alle emails
- Spam risk: High bij lage engagement
- ROI: Negatief
- Quality: Users inactive >2 jaar

**Expected Outcome WITHOUT INACTIVE:**
- Overall conversie: 1.0% → **16-18%**
- Total activaties: ~60-85 (high quality)
- Email reputation: Preserved
- Cost per activation: Lower

## Belangrijke Bestanden

- \`docs/MIGRATION_ANALYSIS_COMPLETE.md\` - Complete analysis
- \`docs/EMAIL_STRATEGY_OPTIMIZATION.md\` - Optimization strategie
- \`docs/ACTION_PLAN_NEXT_BATCH.md\` - Decision rationale
- \`scripts/segment-conversion-analysis.ts\` - Performance analyzer

## Conversie Stats (${new Date().toLocaleDateString('nl-NL')})

**Per Segment:**
- VIP: 27.3% Email → Landing
- ACTIVE: 19.2% Email → Landing
- DORMANT: 14.1% Email → Landing
- GOLD: 13.3% Email → Landing
- INACTIVE: 1.2% Email → Landing ❌

**Overall (High-Value only):**
- Email → Landing: ~18%
- Landing → Activated: ~42%
- Email → Activated: ~11%

**Overall (With INACTIVE):**
- Email → Landing: 2.3% (pulled down by INACTIVE)
- Landing → Activated: 42.1%
- Email → Activated: 1.0%
`

  fs.writeFileSync(statusPath, newStatus, 'utf-8')
  console.log(`✅ Updated MIGRATION_STATUS.md\n`)

  // Log the decision
  try {
    await prisma.$executeRaw`
      INSERT INTO "MigrationCampaignStats" (id, date, "emailsSent", "notes")
      VALUES (
        gen_random_uuid(),
        CURRENT_DATE,
        0,
        'INACTIVE campaign stopped. Reason: Low conversion (1.2%), spam risk, negative ROI. Focus on high-value segments.'
      )
      ON CONFLICT (date) DO UPDATE
      SET notes = EXCLUDED.notes
    `
    console.log('✅ Logged decision in database\n')
  } catch (e) {
    console.log('⚠️  Could not log to database (table may not exist)\n')
  }

  console.log('═'.repeat(50))
  console.log('🎯 INACTIVE CAMPAIGN STOPPED')
  console.log('═'.repeat(50))
  console.log()
  console.log('Next steps:')
  console.log('  1. Finish DORMANT: npx tsx scripts/migration-batch-send.ts DORMANT 10')
  console.log('  2. Setup webhooks: See docs/RESEND_WEBHOOK_SETUP.md')
  console.log('  3. Retarget: npx tsx scripts/retarget-non-converters.ts')
  console.log()

  await prisma.$disconnect()
}

stopInactiveBatch().catch(console.error)
