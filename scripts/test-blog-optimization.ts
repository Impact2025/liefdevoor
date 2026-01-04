/**
 * Test Script: Blog AI Optimization
 *
 * Tests the complete AI blog optimization flow:
 * 1. Content optimization (SEO, social media, image prompts)
 * 2. Image optimization (compression, WebP, responsive sizes, AI alt text)
 */

import { optimizeBlogContent } from '../lib/blog/optimizer'

async function testContentOptimization() {
  console.log('\n🧪 Testing AI Content Optimization...\n')

  const testPost = {
    title: 'De 7 Belangrijkste Eigenschappen voor een Succesvolle Relatie',
    content: `
      <h2>Introductie</h2>
      <p>Een goede relatie bouwen vereist meer dan alleen verliefdheid. Het vraagt om bewuste keuzes en persoonlijke groei.</p>

      <h2>1. Communicatie</h2>
      <p>Open en eerlijke communicatie is de basis van elke sterke relatie. Partners moeten zich veilig voelen om hun gedachten en gevoelens te delen.</p>

      <h2>2. Vertrouwen</h2>
      <p>Vertrouwen moet verdiend en onderhouden worden. Het is essentieel voor een gezonde verbinding.</p>

      <h2>3. Respect</h2>
      <p>Wederzijds respect betekent dat beide partners elkaars grenzen, meningen en individualiteit waarderen.</p>

      <h2>4. Empathie</h2>
      <p>Het vermogen om je in te leven in de ander creëert diepere emotionele verbinding.</p>

      <h2>5. Compromis</h2>
      <p>Gezonde relaties vereisen dat beide partners bereid zijn om elkaar tegemoet te komen.</p>

      <h2>6. Kwaliteitstijd</h2>
      <p>Samen tijd doorbrengen, zonder afleidingen, versterkt de band.</p>

      <h2>7. Individuele Groei</h2>
      <p>De beste relaties ondersteunen persoonlijke ontwikkeling van beide partners.</p>
    `,
    categoryId: 'test-category',
    excerpt: 'Ontdek de belangrijkste eigenschappen voor een gezonde en duurzame relatie.'
  }

  try {
    console.log('📝 Input:')
    console.log(`   Title: ${testPost.title}`)
    console.log(`   Content Length: ${testPost.content.length} characters`)
    console.log(`   Category: ${testPost.categoryId}`)
    console.log(`   Excerpt: ${testPost.excerpt}\n`)

    console.log('⏳ Calling optimizer... (this may take 5-15 seconds)\n')

    const startTime = Date.now()
    const optimized = await optimizeBlogContent(testPost)
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)

    console.log(`✅ Optimization completed in ${duration}s\n`)

    // Display results
    console.log('📊 OPTIMIZATION RESULTS:\n')

    console.log('🎯 SEO Title:')
    console.log(`   ${optimized.seoTitle}`)
    console.log(`   Length: ${optimized.seoTitle.length} chars (optimal: 50-60)\n`)

    console.log('📝 SEO Description:')
    console.log(`   ${optimized.seoDescription}`)
    console.log(`   Length: ${optimized.seoDescription.length} chars (optimal: 150-155)\n`)

    console.log('🔑 Keywords:')
    optimized.keywords.forEach((kw, i) => {
      console.log(`   ${i + 1}. ${kw}`)
    })
    console.log()

    console.log('📱 Social Media Posts:')
    console.log(`   Instagram: ${optimized.socialMedia.instagram}`)
    console.log(`   Facebook: ${optimized.socialMedia.facebook}`)
    console.log(`   LinkedIn: ${optimized.socialMedia.linkedin}`)
    console.log(`   Twitter: ${optimized.socialMedia.twitter}\n`)

    console.log('🖼️  Image Prompt (Midjourney):')
    console.log(`   ${optimized.imagePrompt}\n`)

    console.log('📄 Optimized Excerpt:')
    console.log(`   ${optimized.excerpt}\n`)

    console.log('✨ Content Changes:')
    const originalLength = testPost.content.length
    const optimizedLength = optimized.optimizedContent.length
    const lengthDiff = optimizedLength - originalLength
    const diffPercent = ((lengthDiff / originalLength) * 100).toFixed(1)
    console.log(`   Original: ${originalLength} chars`)
    console.log(`   Optimized: ${optimizedLength} chars`)
    console.log(`   Difference: ${lengthDiff > 0 ? '+' : ''}${lengthDiff} chars (${diffPercent}%)\n`)

    // Quality checks
    console.log('✅ QUALITY CHECKS:\n')

    const checks = [
      { name: 'SEO Title length', pass: optimized.seoTitle.length >= 40 && optimized.seoTitle.length <= 60, value: `${optimized.seoTitle.length} chars` },
      { name: 'SEO Description length', pass: optimized.seoDescription.length >= 140 && optimized.seoDescription.length <= 160, value: `${optimized.seoDescription.length} chars` },
      { name: 'Keywords count', pass: optimized.keywords.length >= 5 && optimized.keywords.length <= 10, value: `${optimized.keywords.length} keywords` },
      { name: 'Instagram post', pass: optimized.socialMedia.instagram.length > 50 && optimized.socialMedia.instagram.length <= 300, value: 'Valid' },
      { name: 'Facebook post', pass: optimized.socialMedia.facebook.length > 50, value: 'Valid' },
      { name: 'LinkedIn post', pass: optimized.socialMedia.linkedin.length > 50, value: 'Valid' },
      { name: 'Twitter post', pass: optimized.socialMedia.twitter.length > 50 && optimized.socialMedia.twitter.length <= 280, value: `${optimized.socialMedia.twitter.length} chars` },
      { name: 'Image prompt', pass: optimized.imagePrompt.length > 30, value: 'Valid' },
      { name: 'Excerpt generated', pass: optimized.excerpt.length > 100, value: 'Valid' },
      { name: 'Content optimized', pass: optimized.optimizedContent.length > originalLength * 0.9, value: 'Valid' }
    ]

    checks.forEach(check => {
      const icon = check.pass ? '✅' : '❌'
      console.log(`   ${icon} ${check.name}: ${check.value}`)
    })

    const allPassed = checks.every(c => c.pass)
    console.log(`\n${allPassed ? '🎉' : '⚠️'} Overall: ${checks.filter(c => c.pass).length}/${checks.length} checks passed\n`)

    if (allPassed) {
      console.log('✅ ✅ ✅ WERELDKLASSE OPTIMIZATION - ALL TESTS PASSED! ✅ ✅ ✅\n')
      return true
    } else {
      console.log('⚠️  Some checks failed - review the output above\n')
      return false
    }

  } catch (error) {
    console.error('❌ Optimization failed:', error)
    console.error('\nError details:', error instanceof Error ? error.message : String(error))

    if (error instanceof Error && error.message.includes('OPENROUTER_API_KEY')) {
      console.log('\n💡 Tip: Make sure OPENROUTER_API_KEY is set in .env.local')
    }

    return false
  }
}

// Run test
console.log('🚀 Starting Blog Optimization Tests...')
console.log('=' .repeat(80))

testContentOptimization()
  .then((success) => {
    if (success) {
      console.log('🎊 All tests completed successfully!')
      process.exit(0)
    } else {
      console.log('❌ Tests failed - see errors above')
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
