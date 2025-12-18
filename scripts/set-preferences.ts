import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setPreferences() {
  console.log('⚙️ Setting preferences for demo users...\n')

  // Set preferences for female users to see males
  const femalePrefs = {
    genderPreference: 'MALE',
    minAge: 25,
    maxAge: 45,
    maxDistance: 100, // 100km radius
  }

  // Set preferences for male users to see females
  const malePrefs = {
    genderPreference: 'FEMALE',
    minAge: 23,
    maxAge: 40,
    maxDistance: 100,
  }

  // Update Sophie (female → sees males)
  await prisma.user.update({
    where: { email: 'sophie@demo.nl' },
    data: { preferences: JSON.stringify(femalePrefs) },
  })
  console.log('✅ Sophie → will see MALES (25-45)')

  // Update Emma (female → sees males)
  await prisma.user.update({
    where: { email: 'emma@demo.nl' },
    data: { preferences: JSON.stringify(femalePrefs) },
  })
  console.log('✅ Emma → will see MALES (25-45)')

  // Update Lisa (female → sees males)
  await prisma.user.update({
    where: { email: 'lisa@demo.nl' },
    data: { preferences: JSON.stringify(femalePrefs) },
  })
  console.log('✅ Lisa → will see MALES (25-45)')

  // Update Julia (female → sees males)
  await prisma.user.update({
    where: { email: 'julia@demo.nl' },
    data: { preferences: JSON.stringify(femalePrefs) },
  })
  console.log('✅ Julia → will see MALES (25-45)')

  // Update Mila (female → sees males)
  await prisma.user.update({
    where: { email: 'mila@demo.nl' },
    data: { preferences: JSON.stringify(femalePrefs) },
  })
  console.log('✅ Mila → will see MALES (25-45)')

  console.log()

  // Update Liam (male → sees females)
  await prisma.user.update({
    where: { email: 'liam@demo.nl' },
    data: { preferences: JSON.stringify(malePrefs) },
  })
  console.log('✅ Liam → will see FEMALES (23-40)')

  // Update Noah (male → sees females)
  await prisma.user.update({
    where: { email: 'noah@demo.nl' },
    data: { preferences: JSON.stringify(malePrefs) },
  })
  console.log('✅ Noah → will see FEMALES (23-40)')

  // Update Daan (male → sees females)
  await prisma.user.update({
    where: { email: 'daan@demo.nl' },
    data: { preferences: JSON.stringify(malePrefs) },
  })
  console.log('✅ Daan → will see FEMALES (23-40)')

  // Update Thijs (male → sees females)
  await prisma.user.update({
    where: { email: 'thijs@demo.nl' },
    data: { preferences: JSON.stringify(malePrefs) },
  })
  console.log('✅ Thijs → will see FEMALES (23-40)')

  // Update Max (male → sees females)
  await prisma.user.update({
    where: { email: 'max@demo.nl' },
    data: { preferences: JSON.stringify(malePrefs) },
  })
  console.log('✅ Max → will see FEMALES (23-40)')

  console.log('\n🎉 All preferences set!')
  console.log('\nPreferences configured:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('👩 Females see: MALES (age 25-45, within 100km)')
  console.log('👨 Males see: FEMALES (age 23-40, within 100km)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

setPreferences()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
