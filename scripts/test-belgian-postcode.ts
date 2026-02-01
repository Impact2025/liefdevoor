/**
 * Test Belgian Postcode Support
 *
 * This script tests that Belgian postcodes work correctly
 * in the geocoding system.
 */

import {
  isValidDutchPostcode,
  isValidBelgianPostcode,
  isValidPostcode,
  detectPostcodeCountry,
  geocodePostcode
} from '@/lib/services/geocoding'

async function testPostcodeValidation() {
  console.log('=== Testing Postcode Validation ===\n')

  // Test Dutch postcodes
  const dutchTests = [
    { postcode: '1012AB', expected: true, country: 'NL' },
    { postcode: '1012 AB', expected: true, country: 'NL' },
    { postcode: '2000AA', expected: true, country: 'NL' },
    { postcode: '9999ZZ', expected: true, country: 'NL' },
    { postcode: '0123AB', expected: false, country: null }, // Invalid: starts with 0
    { postcode: '123AB', expected: false, country: null }, // Invalid: only 3 digits
  ]

  // Test Belgian postcodes
  const belgianTests = [
    { postcode: '1000', expected: true, country: 'BE' },
    { postcode: '2000', expected: true, country: 'BE' },
    { postcode: '9000', expected: true, country: 'BE' },
    { postcode: '1234', expected: true, country: 'BE' },
    { postcode: '0123', expected: false, country: null }, // Invalid: starts with 0
    { postcode: '123', expected: false, country: null }, // Invalid: only 3 digits
  ]

  console.log('Dutch Postcode Tests:')
  dutchTests.forEach(({ postcode, expected, country }) => {
    const isDutchValid = isValidDutchPostcode(postcode)
    const isValid = isValidPostcode(postcode)
    const detectedCountry = detectPostcodeCountry(postcode)
    const pass = (isDutchValid === expected && isValid === expected && detectedCountry === country)
    console.log(`  ${pass ? '✓' : '✗'} ${postcode.padEnd(10)} - Valid: ${isValid}, Country: ${detectedCountry || 'None'}`)
  })

  console.log('\nBelgian Postcode Tests:')
  belgianTests.forEach(({ postcode, expected, country }) => {
    const isBelgianValid = isValidBelgianPostcode(postcode)
    const isValid = isValidPostcode(postcode)
    const detectedCountry = detectPostcodeCountry(postcode)
    const pass = (isBelgianValid === expected && isValid === expected && detectedCountry === country)
    console.log(`  ${pass ? '✓' : '✗'} ${postcode.padEnd(10)} - Valid: ${isValid}, Country: ${detectedCountry || 'None'}`)
  })
}

async function testGeocoding() {
  console.log('\n=== Testing Geocoding ===\n')

  // Test a Belgian postcode (Brussels)
  console.log('Testing Belgian postcode: 1000 (Brussels)')
  try {
    const result = await geocodePostcode('1000')
    if (result) {
      console.log('  ✓ Successfully geocoded!')
      console.log(`    City: ${result.city}`)
      console.log(`    Region: ${result.region || 'N/A'}`)
      console.log(`    Country: ${result.country}`)
      console.log(`    Coordinates: ${result.latitude}, ${result.longitude}`)
    } else {
      console.log('  ✗ Geocoding returned null')
    }
  } catch (error) {
    console.log(`  ✗ Error: ${error}`)
  }

  // Test a Dutch postcode (Amsterdam)
  console.log('\nTesting Dutch postcode: 1012AB (Amsterdam)')
  try {
    const result = await geocodePostcode('1012AB')
    if (result) {
      console.log('  ✓ Successfully geocoded!')
      console.log(`    City: ${result.city}`)
      console.log(`    Region: ${result.region || 'N/A'}`)
      console.log(`    Country: ${result.country}`)
      console.log(`    Coordinates: ${result.latitude}, ${result.longitude}`)
    } else {
      console.log('  ✗ Geocoding returned null')
    }
  } catch (error) {
    console.log(`  ✗ Error: ${error}`)
  }

  // Test more Belgian postcodes
  const belgianCities = [
    { postcode: '2000', city: 'Antwerp' },
    { postcode: '9000', city: 'Ghent' },
    { postcode: '4000', city: 'Liège' },
  ]

  console.log('\nTesting additional Belgian postcodes:')
  for (const { postcode, city } of belgianCities) {
    try {
      const result = await geocodePostcode(postcode)
      if (result) {
        console.log(`  ✓ ${postcode} (${city}): ${result.city}, ${result.country}`)
      } else {
        console.log(`  ✗ ${postcode} (${city}): Not found`)
      }
    } catch (error) {
      console.log(`  ✗ ${postcode} (${city}): Error - ${error}`)
    }
  }
}

async function main() {
  console.log('🇧🇪 Belgian Postcode Support Test\n')
  console.log('This test verifies that Belgian postcodes (4 digits)')
  console.log('work alongside Dutch postcodes (4 digits + 2 letters)\n')

  await testPostcodeValidation()
  await testGeocoding()

  console.log('\n✅ Test complete!\n')
}

main().catch(console.error)
