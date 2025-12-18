/**
 * Analyze WordPress database dump
 */

import fs from 'fs'
import path from 'path'

function analyzeWordPressDump() {
  const filePath = path.join(process.cwd(), 'Huidigedatabase', 'databaseOogvoorLiefde.sql')
  const sql = fs.readFileSync(filePath, 'utf8')
  const lines = sql.split('\n')

  console.log('📊 WORDPRESS DATABASE ANALYSE')
  console.log('=' .repeat(60))
  console.log()

  // File info
  const fileSize = fs.statSync(filePath).size
  console.log('📁 Bestandsinfo:')
  console.log(`   Grootte: ${(fileSize / 1024 / 1024).toFixed(2)} MB`)
  console.log(`   Regels: ${lines.length.toLocaleString()}`)
  console.log()

  // Extract database name and date
  const dbMatch = sql.match(/Database: `([^`]+)`/)
  const dateMatch = sql.match(/Gegenereerd op: (.+)/)
  if (dbMatch) console.log(`   Database: ${dbMatch[1]}`)
  if (dateMatch) console.log(`   Export datum: ${dateMatch[1]}`)
  console.log()

  // Count tables
  const tableMatches = sql.match(/CREATE TABLE `([^`]+)`/g) || []
  const tables = tableMatches.map(m => m.match(/`([^`]+)`/)![1])

  console.log(`📋 Tabellen: ${tables.length} totaal`)
  console.log()

  // Categorize tables
  const wpCore = tables.filter(t => t.match(/^wp_(posts|users|comments|options|postmeta|usermeta|terms|term|links)$/))
  const wpPlugin = tables.filter(t => !wpCore.includes(t) && t.startsWith('wp_'))

  console.log('   WordPress Core tabellen:')
  wpCore.forEach(t => console.log(`     - ${t}`))
  console.log()

  console.log(`   Plugin tabellen (${wpPlugin.length}):`)
  // Group by plugin prefix
  const pluginGroups: Record<string, string[]> = {}
  wpPlugin.forEach(t => {
    const prefix = t.split('_').slice(0, 3).join('_') || t
    if (!pluginGroups[prefix]) pluginGroups[prefix] = []
    pluginGroups[prefix].push(t)
  })
  Object.entries(pluginGroups).forEach(([prefix, tbls]) => {
    console.log(`     ${prefix}* (${tbls.length} tabellen)`)
  })
  console.log()

  // Analyze users
  console.log('👥 GEBRUIKERS ANALYSE:')
  const userSection = sql.substring(
    sql.indexOf('INSERT INTO `wp_users`'),
    sql.indexOf(';', sql.indexOf('INSERT INTO `wp_users`'))
  )

  // Extract user data
  const userPattern = /\((\d+), '([^']+)', '\$P\$[^']+', '([^']+)', '([^']*)', '[^']*', '([^']+)'/g
  const users: Array<{id: string, login: string, nicename: string, email: string, registered: string}> = []
  let match
  while ((match = userPattern.exec(userSection)) !== null) {
    users.push({
      id: match[1],
      login: match[2],
      nicename: match[3],
      email: match[4],
      registered: match[5]
    })
  }

  console.log(`   Totaal gebruikers: ${users.length}`)
  console.log()
  users.forEach(u => {
    console.log(`   ${u.id}. ${u.login}`)
    console.log(`      Email: ${u.email}`)
    console.log(`      Geregistreerd: ${u.registered}`)
    console.log()
  })

  // Analyze posts
  console.log('📝 CONTENT ANALYSE:')
  const postCountMatch = sql.match(/INSERT INTO `wp_posts`[^;]*/g)
  if (postCountMatch) {
    const postData = postCountMatch.join('\n')
    const postTypeMatches = postData.match(/'post_type', '([^']+)'/g) || []
    const postTypes: Record<string, number> = {}
    postTypeMatches.forEach(m => {
      const type = m.match(/'post_type', '([^']+)'/)![1]
      postTypes[type] = (postTypes[type] || 0) + 1
    })

    console.log('   Post types:')
    Object.entries(postTypes).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
      console.log(`     - ${type}: ${count}`)
    })
  }
  console.log()

  // Look for dating-specific data
  console.log('💕 DATING FUNCTIONALITEIT:')
  const datingKeywords = ['match', 'like', 'swipe', 'date', 'profile', 'message', 'chat', 'contact']
  const foundKeywords: string[] = []

  datingKeywords.forEach(keyword => {
    const regex = new RegExp(`wp_[a-z_]*${keyword}[a-z_]*`, 'gi')
    const matches = sql.match(regex)
    if (matches) {
      const unique = Array.from(new Set(matches.map(m => m.toLowerCase())))
      unique.forEach(m => {
        if (!foundKeywords.includes(m)) {
          foundKeywords.push(m)
        }
      })
    }
  })

  if (foundKeywords.length > 0) {
    console.log('   Gevonden dating-gerelateerde tabellen/velden:')
    foundKeywords.forEach(k => console.log(`     - ${k}`))
  } else {
    console.log('   ⚠️  Geen specifieke dating tabellen gevonden')
    console.log('   Dit lijkt een standaard WordPress site te zijn')
  }
  console.log()

  // Check for common dating plugins
  console.log('🔌 MOGELIJKE DATING PLUGINS:')
  const datingPlugins = [
    'buddypress',
    'peepso',
    'ultimatemember',
    'profilebuilder',
    'rtmedia',
    'bp',  // BuddyPress prefix
    'um_', // Ultimate Member
    'pm_'  // ProfilePress/etc
  ]

  const foundPlugins: string[] = []
  datingPlugins.forEach(plugin => {
    const hasTables = tables.some(t => t.includes(plugin))
    if (hasTables) {
      const pluginTables = tables.filter(t => t.includes(plugin))
      foundPlugins.push(`${plugin} (${pluginTables.length} tabellen)`)
    }
  })

  if (foundPlugins.length > 0) {
    foundPlugins.forEach(p => console.log(`   ✓ ${p}`))
  } else {
    console.log('   ❌ Geen bekende dating plugins gevonden')
  }
  console.log()

  // Summary
  console.log('📊 SAMENVATTING:')
  console.log(`   ✓ WordPress database uit ${dateMatch ? dateMatch[1] : 'onbekende datum'}`)
  console.log(`   ✓ ${tables.length} tabellen (${wpCore.length} core, ${wpPlugin.length} plugins)`)
  console.log(`   ✓ ${users.length} gebruikers`)
  console.log()

  // Migration advice
  console.log('🔄 MIGRATIE ADVIES:')
  console.log()
  console.log('   Deze WordPress database bevat:')
  console.log(`   - Gebruikers: ${users.length} accounts`)
  console.log('   - Content: WordPress posts/pages')
  console.log('   - Plugin data: Diverse WordPress plugins')
  console.log()
  console.log('   Om te migreren naar Next.js/Prisma:')
  console.log('   1. Extract gebruikersdata (email, naam, registratiedatum)')
  console.log('   2. Converteer WordPress wachtwoorden (phpass → bcrypt)')
  console.log('   3. Identificeer custom profile velden in wp_usermeta')
  console.log('   4. Check voor dating-specifieke data in plugin tabellen')
  console.log('   5. Migreer relevante content/media')
  console.log()
}

analyzeWordPressDump()
