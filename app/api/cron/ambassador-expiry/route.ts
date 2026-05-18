import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email/send'

// POST /api/cron/ambassador-expiry
// Dagelijks om 07:00 UTC — zet verlopen ambassadeurs terug naar FREE
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const expired = await prisma.ambassador.findMany({
      where: { status: 'ACTIVE', freeUntil: { lt: now } },
      include: { user: { select: { id: true, name: true, email: true, subscriptionTier: true } } },
    })

    let reverted = 0
    let skipped = 0

    for (const ambassador of expired) {
      const { user } = ambassador

      const activePaidSub = await prisma.subscription.findFirst({
        where: {
          userId: user.id,
          status: 'active',
          OR: [{ endDate: null }, { endDate: { gt: now } }],
        },
      })

      if (activePaidSub || user.subscriptionTier === 'FREE') {
        skipped++
        continue
      }

      await prisma.$transaction([
        prisma.user.update({ where: { id: user.id }, data: { subscriptionTier: 'FREE' } }),
        prisma.ambassador.update({ where: { id: ambassador.id }, data: { status: 'INACTIVE', deactivatedAt: now } }),
      ])

      // Email naar ambassadeur dat gratis lidmaatschap is verlopen
      if (user.email) {
        await sendEmail({
          to: user.email,
          subject: 'Jouw gratis lidmaatschap is verlopen',
          html: `<p>Hoi ${user.name || ''}!</p><p>Jouw gratis ambassadeurslidmaatschap bij Liefde Voor Iedereen is helaas verlopen.</p><p>Bedankt voor alles wat je hebt gedaan als ambassadeur. We stellen het enorm op prijs!</p><p>Wil je de site blijven gebruiken? Je kunt een lidmaatschap nemen op <a href="${process.env.NEXTAUTH_URL}/premium">liefdevooriedereen.nl/premium</a>.</p><p>Met warme groet,<br><strong>Vincent</strong></p>`,
          text: `Hoi ${user.name || ''}!\n\nJouw gratis ambassadeurslidmaatschap is verlopen.\n\nBedankt voor alles!\n\nVincent`,
          category: 'AMBASSADOR_EXPIRED',
        }).catch(err => console.error('[Ambassador cron] Expiry email mislukt:', err))
      }

      reverted++
    }

    console.log(`[Ambassador cron] Verlopen: ${reverted}, overgeslagen: ${skipped}`)
    return NextResponse.json({ success: true, reverted, skipped })
  } catch (error) {
    console.error('[Ambassador cron] Error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
