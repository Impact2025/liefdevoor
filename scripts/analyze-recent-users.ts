/**
 * Script om de laatste 5 nieuwe gebruikers te analyseren
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function analyzeRecentUsers() {
  try {
    console.log('📊 Laatste 5 nieuwe gebruikers analyseren...\n')

    const users = await prisma.user.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        role: true,
        createdAt: true,
        profileComplete: true,
        isOnboarded: true,
        onboardingStep: true,
        bio: true,
        birthDate: true,
        gender: true,
        city: true,
        postcode: true,
        subscriptionTier: true,
        lookingFor: true,
        interests: true,
        occupation: true,
        registrationSource: true,
        visionImpairedMode: true,
        lvbMode: true,
        photos: {
          select: {
            id: true,
            url: true,
            createdAt: true
          },
          take: 5,
          orderBy: {
            createdAt: 'desc'
          }
        },
        accounts: {
          select: {
            provider: true
          }
        },
        subscriptions: {
          select: {
            plan: true,
            status: true,
            startDate: true
          },
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (users.length === 0) {
      console.log('❌ Geen gebruikers gevonden')
      return
    }

    console.log(`✅ ${users.length} gebruikers gevonden\n`)
    console.log('='.repeat(80))

    for (const user of users) {
      const registrationDate = new Date(user.createdAt)
      const now = new Date()
      const daysSince = Math.floor((now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24))
      const hoursSince = Math.floor((now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60))

      console.log(`\n👤 ${user.name || 'Onbekend'}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   ID: ${user.id}`)
      if (daysSince === 0) {
        console.log(`   Geregistreerd: ${registrationDate.toLocaleString('nl-NL')} (${hoursSince} uur geleden)`)
      } else {
        console.log(`   Geregistreerd: ${registrationDate.toLocaleString('nl-NL')} (${daysSince} dagen geleden)`)
      }
      console.log(`   Email geverifieerd: ${user.emailVerified ? '✅ Ja' : '❌ Nee'}`)
      console.log(`   Rol: ${user.role}`)

      // Subscription info
      let subscriptionInfo = user.subscriptionTier || 'FREE'
      if (user.subscriptions && user.subscriptions.length > 0) {
        const latestSub = user.subscriptions[0]
        subscriptionInfo += ` (${latestSub.status} - ${latestSub.plan})`
      }
      console.log(`   Abonnement: ${subscriptionInfo}`)

      // Registration source
      if (user.registrationSource) {
        console.log(`   📍 Doelgroep: ${user.registrationSource}`)
      }

      // Accessibility features
      if (user.visionImpairedMode || user.lvbMode) {
        const features = []
        if (user.visionImpairedMode) features.push('♿ Slechtzienden modus')
        if (user.lvbMode) features.push('🧠 LVB modus')
        console.log(`   Toegankelijkheid: ${features.join(', ')}`)
      }

      // Profile info
      console.log(`\n   📋 Profiel:`)
      console.log(`      - Compleet: ${user.profileComplete ? '✅ Ja' : '❌ Nee'}`)
      console.log(`      - Onboarding: ${user.isOnboarded ? '✅ Voltooid' : `⏳ Stap ${user.onboardingStep}`}`)
      console.log(`      - Bio: ${user.bio ? `"${user.bio.substring(0, 50)}${user.bio.length > 50 ? '...' : ''}"` : '❌ Niet ingevuld'}`)

      // Calculate age from birthDate
      const age = user.birthDate ? Math.floor((Date.now() - new Date(user.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : null
      console.log(`      - Leeftijd: ${age || 'Niet ingevuld'}`)
      console.log(`      - Geslacht: ${user.gender || 'Niet ingevuld'}`)
      console.log(`      - Zoekt: ${user.lookingFor || 'Niet ingevuld'}`)
      console.log(`      - Locatie: ${user.city || 'Niet ingevuld'}`)
      console.log(`      - Postcode: ${user.postcode || 'Niet ingevuld'}`)
      console.log(`      - Beroep: ${user.occupation || 'Niet ingevuld'}`)
      console.log(`      - Interesses: ${user.interests || 'Niet ingevuld'}`)
      console.log(`      - Foto's: ${user.photos.length > 0 ? `✅ ${user.photos.length}` : '❌ Geen'}`)

      // Login method
      if (user.accounts && user.accounts.length > 0) {
        const providers = user.accounts.map(a => a.provider).join(', ')
        console.log(`\n   🔐 Login methode: ${providers}`)
      } else {
        console.log(`\n   🔐 Login methode: Credentials (email/wachtwoord)`)
      }

      console.log('\n' + '-'.repeat(80))
    }

    // Statistieken
    console.log('\n📈 STATISTIEKEN (laatste 5 gebruikers):')
    const emailVerifiedCount = users.filter(u => u.emailVerified).length
    const profileCompleteCount = users.filter(u => u.profileComplete).length
    const withPhotosCount = users.filter(u => u.photos.length > 0).length
    const premiumCount = users.filter(u => u.subscriptionTier === 'PREMIUM' || u.subscriptionTier === 'GOLD').length
    const googleUsersCount = users.filter(u => u.accounts?.some(a => a.provider === 'google')).length
    const onboardedCount = users.filter(u => u.isOnboarded).length
    const accessibilityCount = users.filter(u => u.visionImpairedMode || u.lvbMode).length

    console.log(`   - Email geverifieerd: ${emailVerifiedCount}/${users.length} (${Math.round(emailVerifiedCount/users.length*100)}%)`)
    console.log(`   - Onboarding voltooid: ${onboardedCount}/${users.length} (${Math.round(onboardedCount/users.length*100)}%)`)
    console.log(`   - Profiel compleet: ${profileCompleteCount}/${users.length} (${Math.round(profileCompleteCount/users.length*100)}%)`)
    console.log(`   - Heeft foto's: ${withPhotosCount}/${users.length} (${Math.round(withPhotosCount/users.length*100)}%)`)
    console.log(`   - Premium/Gold: ${premiumCount}/${users.length} (${Math.round(premiumCount/users.length*100)}%)`)
    console.log(`   - Google login: ${googleUsersCount}/${users.length} (${Math.round(googleUsersCount/users.length*100)}%)`)
    console.log(`   - Toegankelijkheid features: ${accessibilityCount}/${users.length} (${Math.round(accessibilityCount/users.length*100)}%)`)

    // Doelgroep verdeling
    const doelgroepen = users.filter(u => u.registrationSource).map(u => u.registrationSource)
    if (doelgroepen.length > 0) {
      console.log(`\n   📍 Doelgroepen:`)
      const doelgroepCounts: Record<string, number> = {}
      doelgroepen.forEach(d => {
        if (d) doelgroepCounts[d] = (doelgroepCounts[d] || 0) + 1
      })
      Object.entries(doelgroepCounts).forEach(([doelgroep, count]) => {
        console.log(`      - ${doelgroep}: ${count}`)
      })
    }

    // Audit log check voor spam/issues
    console.log('\n🛡️  SPAM/SECURITY CHECK:')
    let hasSecurityIssues = false
    for (const user of users) {
      const auditLogs = await prisma.auditLog.findMany({
        where: {
          userId: user.id,
          action: {
            in: [
              'REGISTER_HONEYPOT_TRIGGERED',
              'REGISTER_SPAM_DETECTED',
              'REGISTER_BLOCKED_EMAIL',
              'REGISTER_BLOCKED_DOMAIN',
              'LOGIN_FAILED'
            ]
          }
        },
        take: 5,
        orderBy: { createdAt: 'desc' }
      })

      if (auditLogs.length > 0) {
        hasSecurityIssues = true
        console.log(`   ⚠️  ${user.email}: ${auditLogs.length} security events`)
        auditLogs.forEach(log => {
          console.log(`      - ${log.action} (${new Date(log.createdAt).toLocaleString('nl-NL')})`)
        })
      }
    }

    if (!hasSecurityIssues) {
      console.log(`   ✅ Geen security issues gevonden`)
    }

    console.log('\n✅ Analyse compleet!')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

analyzeRecentUsers()
