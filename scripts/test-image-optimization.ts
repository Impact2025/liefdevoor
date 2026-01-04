/**
 * Test Script: Image Optimization
 *
 * Tests the image optimization pipeline:
 * 1. Compression with mozjpeg
 * 2. WebP conversion
 * 3. Responsive size generation
 * 4. AI alt text generation (with fallback)
 */

import sharp from 'sharp'
import { optimizeImage, validateImage, getImageDimensions } from '../lib/blog/image-optimizer'

async function createTestImage(): Promise<Buffer> {
  // Create a test image (1920x1080 red rectangle with text)
  const svg = `
    <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
      <rect width="1920" height="1080" fill="#e91e63"/>
      <text x="50%" y="50%" font-family="Arial" font-size="80" fill="white" text-anchor="middle" dominant-baseline="middle">
        Wereldklasse Dating App Test Image
      </text>
    </svg>
  `

  return await sharp(Buffer.from(svg))
    .jpeg({ quality: 90 })
    .toBuffer()
}

async function testImageOptimization() {
  console.log('\n🧪 Testing Image Optimization...\n')

  try {
    // Create test image
    console.log('📸 Creating test image (1920x1080)...')
    const testImageBuffer = await createTestImage()
    const originalSize = testImageBuffer.length
    console.log(`   Original size: ${(originalSize / 1024).toFixed(2)} KB\n`)

    // Test validation
    console.log('🔍 Testing image validation...')
    const validation = validateImage(testImageBuffer, 10)
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.error}`)
    }
    console.log('   ✅ Image validation passed\n')

    // Test dimension extraction
    console.log('📐 Testing dimension extraction...')
    const dimensions = await getImageDimensions(testImageBuffer)
    console.log(`   Dimensions: ${dimensions.width}x${dimensions.height}`)
    if (dimensions.width !== 1920 || dimensions.height !== 1080) {
      throw new Error(`Unexpected dimensions: ${dimensions.width}x${dimensions.height}`)
    }
    console.log('   ✅ Dimensions correct\n')

    // Test optimization
    console.log('⏳ Optimizing image... (this may take a few seconds)\n')

    const startTime = Date.now()
    const optimized = await optimizeImage(testImageBuffer, 'test-blog-image.jpg', {
      title: 'De Perfecte Eerste Date: 10 Tips voor Succes',
      category: 'Dating Tips',
      maxWidth: 1920,
      quality: 85,
      generateWebP: true,
      generateResponsiveSizes: true
    })
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)

    console.log(`✅ Optimization completed in ${duration}s\n`)

    // Display results
    console.log('📊 OPTIMIZATION RESULTS:\n')

    console.log('🖼️  Main Image:')
    console.log(`   URL: ${optimized.optimizedUrl}`)
    console.log(`   Size: ${(optimized.size / 1024).toFixed(2)} KB`)
    console.log(`   Dimensions: ${optimized.width}x${optimized.height}`)
    console.log(`   Format: ${optimized.format}`)
    console.log(`   Compression: ${(((originalSize - optimized.size) / originalSize) * 100).toFixed(1)}%\n`)

    console.log('🌐 WebP Version:')
    if (optimized.webpUrl) {
      console.log(`   ✅ Generated: ${optimized.webpUrl}\n`)
    } else {
      console.log(`   ❌ Not generated\n`)
    }

    console.log('📱 Responsive Sizes:')
    console.log(`   Thumbnail (400px): ${optimized.thumbnailUrl || 'Not generated'}`)
    console.log(`   Medium (800px): ${optimized.mediumUrl || 'Not generated'}`)
    console.log(`   Large (1200px): ${optimized.largeUrl || 'Not generated'}\n`)

    console.log('🏷️  SEO Alt Text:')
    console.log(`   "${optimized.alt}"`)
    console.log(`   Length: ${optimized.alt.length} chars (max 125)\n`)

    // Quality checks
    console.log('✅ QUALITY CHECKS:\n')

    const compressionRatio = ((originalSize - optimized.size) / originalSize) * 100
    const checks = [
      { name: 'Image compressed', pass: compressionRatio > 10, value: `${compressionRatio.toFixed(1)}% reduction` },
      { name: 'Size within limits', pass: optimized.size > 0 && optimized.size < originalSize, value: `${(optimized.size / 1024).toFixed(2)} KB` },
      { name: 'Correct dimensions', pass: optimized.width === 1920 && optimized.height === 1080, value: `${optimized.width}x${optimized.height}` },
      { name: 'Correct format', pass: optimized.format === 'jpeg', value: optimized.format },
      { name: 'WebP generated', pass: !!optimized.webpUrl, value: optimized.webpUrl ? 'Yes' : 'No' },
      { name: 'Thumbnail generated', pass: !!optimized.thumbnailUrl, value: optimized.thumbnailUrl ? 'Yes' : 'No' },
      { name: 'Medium generated', pass: !!optimized.mediumUrl, value: optimized.mediumUrl ? 'Yes' : 'No' },
      { name: 'Large generated', pass: !!optimized.largeUrl, value: optimized.largeUrl ? 'Yes' : 'No' },
      { name: 'Alt text valid', pass: optimized.alt.length > 10 && optimized.alt.length <= 125, value: `${optimized.alt.length} chars` },
      { name: 'URLs generated', pass: !!optimized.optimizedUrl && !!optimized.originalUrl, value: 'Yes' }
    ]

    checks.forEach(check => {
      const icon = check.pass ? '✅' : '❌'
      console.log(`   ${icon} ${check.name}: ${check.value}`)
    })

    const allPassed = checks.every(c => c.pass)
    console.log(`\n${allPassed ? '🎉' : '⚠️'} Overall: ${checks.filter(c => c.pass).length}/${checks.length} checks passed\n`)

    if (allPassed) {
      console.log('✅ ✅ ✅ WERELDKLASSE IMAGE OPTIMIZATION - ALL TESTS PASSED! ✅ ✅ ✅\n')
      return true
    } else {
      console.log('⚠️  Some checks failed - review the output above\n')
      return false
    }

  } catch (error) {
    console.error('❌ Image optimization failed:', error)
    console.error('\nError details:', error instanceof Error ? error.message : String(error))

    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:', error.stack)
    }

    return false
  }
}

async function testValidation() {
  console.log('\n🧪 Testing Image Validation...\n')

  try {
    // Test: Image too large
    console.log('📝 Test 1: Image too large (should fail)')
    const largeBuffer = Buffer.alloc(15 * 1024 * 1024) // 15MB
    const validation1 = validateImage(largeBuffer, 10)
    if (validation1.valid) {
      throw new Error('Validation should have failed for large image')
    }
    console.log(`   ✅ Correctly rejected: ${validation1.error}\n`)

    // Test: Valid image
    console.log('📝 Test 2: Valid image (should pass)')
    const smallBuffer = Buffer.alloc(2 * 1024 * 1024) // 2MB
    const validation2 = validateImage(smallBuffer, 10)
    if (!validation2.valid) {
      throw new Error('Validation should have passed for small image')
    }
    console.log(`   ✅ Correctly accepted\n`)

    return true

  } catch (error) {
    console.error('❌ Validation test failed:', error)
    return false
  }
}

// Run tests
async function runAllTests() {
  console.log('🚀 Starting Image Optimization Tests...')
  console.log('=' .repeat(80))

  const results = []

  results.push(await testValidation())
  results.push(await testImageOptimization())

  console.log('=' .repeat(80))
  console.log('\n📊 FINAL RESULTS:\n')

  const totalTests = results.length
  const passedTests = results.filter(r => r).length

  console.log(`   Total Tests: ${totalTests}`)
  console.log(`   Passed: ${passedTests}`)
  console.log(`   Failed: ${totalTests - passedTests}\n`)

  if (passedTests === totalTests) {
    console.log('🎊 All image optimization tests completed successfully!\n')
    process.exit(0)
  } else {
    console.log('❌ Some tests failed - see errors above\n')
    process.exit(1)
  }
}

runAllTests().catch((error) => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
