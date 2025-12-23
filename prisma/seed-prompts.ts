/**
 * Seed Daily Prompts for Progressive Profiling
 *
 * Run with: npx ts-node prisma/seed-prompts.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const dailyPrompts = [
  // Lifestyle
  {
    question: 'Beach or Mountains?',
    questionNl: 'Strand of Bergen?',
    emoji: '🏖️🏔️',
    options: [
      { value: 'beach', label: 'Strand', emoji: '🏖️' },
      { value: 'mountains', label: 'Bergen', emoji: '🏔️' },
    ],
    vectorTag: 'vacation-preference',
    category: 'lifestyle',
    weight: 1.0,
    priority: 10,
  },
  {
    question: 'Early Bird or Night Owl?',
    questionNl: 'Vroege vogel of Nachtuil?',
    emoji: '🌅🌙',
    options: [
      { value: 'early', label: 'Vroege vogel', emoji: '🌅' },
      { value: 'night', label: 'Nachtuil', emoji: '🌙' },
    ],
    vectorTag: 'sleep-schedule',
    category: 'lifestyle',
    weight: 1.2,
    priority: 9,
  },
  {
    question: 'City life or Countryside?',
    questionNl: 'Stadsleven of Platteland?',
    emoji: '🏙️🌳',
    options: [
      { value: 'city', label: 'Stad', emoji: '🏙️' },
      { value: 'countryside', label: 'Platteland', emoji: '🌳' },
    ],
    vectorTag: 'living-preference',
    category: 'lifestyle',
    weight: 1.5,
    priority: 8,
  },

  // Social
  {
    question: 'Big party or Cozy dinner?',
    questionNl: 'Groot feest of Gezellig etentje?',
    emoji: '🎉🍷',
    options: [
      { value: 'party', label: 'Groot feest', emoji: '🎉' },
      { value: 'dinner', label: 'Gezellig etentje', emoji: '🍷' },
    ],
    vectorTag: 'social-style',
    category: 'social',
    weight: 1.3,
    priority: 7,
  },
  {
    question: 'Many friends or Few close friends?',
    questionNl: 'Veel vrienden of Paar goede vrienden?',
    emoji: '👥💕',
    options: [
      { value: 'many', label: 'Veel vrienden', emoji: '👥' },
      { value: 'few', label: 'Paar goede vrienden', emoji: '💕' },
    ],
    vectorTag: 'friendship-style',
    category: 'social',
    weight: 1.0,
    priority: 6,
  },

  // Food
  {
    question: 'Cook at home or Eat out?',
    questionNl: 'Thuis koken of Uit eten?',
    emoji: '👨‍🍳🍽️',
    options: [
      { value: 'cook', label: 'Thuis koken', emoji: '👨‍🍳' },
      { value: 'eat-out', label: 'Uit eten', emoji: '🍽️' },
    ],
    vectorTag: 'dining-preference',
    category: 'food',
    weight: 1.0,
    priority: 5,
  },
  {
    question: 'Sweet or Savory?',
    questionNl: 'Zoet of Hartig?',
    emoji: '🍰🧀',
    options: [
      { value: 'sweet', label: 'Zoet', emoji: '🍰' },
      { value: 'savory', label: 'Hartig', emoji: '🧀' },
    ],
    vectorTag: 'taste-preference',
    category: 'food',
    weight: 0.8,
    priority: 4,
  },

  // Hobbies
  {
    question: 'Active vacation or Relaxing vacation?',
    questionNl: 'Actieve vakantie of Relaxte vakantie?',
    emoji: '🏃‍♂️😌',
    options: [
      { value: 'active', label: 'Actief', emoji: '🏃‍♂️' },
      { value: 'relaxing', label: 'Relaxed', emoji: '😌' },
    ],
    vectorTag: 'vacation-style',
    category: 'hobbies',
    weight: 1.2,
    priority: 5,
  },
  {
    question: 'Movies or Series?',
    questionNl: 'Films of Series?',
    emoji: '🎬📺',
    options: [
      { value: 'movies', label: 'Films', emoji: '🎬' },
      { value: 'series', label: 'Series', emoji: '📺' },
    ],
    vectorTag: 'entertainment-preference',
    category: 'hobbies',
    weight: 0.8,
    priority: 3,
  },
  {
    question: 'Indoor or Outdoor activities?',
    questionNl: 'Binnen of Buiten activiteiten?',
    emoji: '🏠🌲',
    options: [
      { value: 'indoor', label: 'Binnen', emoji: '🏠' },
      { value: 'outdoor', label: 'Buiten', emoji: '🌲' },
    ],
    vectorTag: 'activity-location',
    category: 'hobbies',
    weight: 1.0,
    priority: 4,
  },

  // Values
  {
    question: 'Adventure or Stability?',
    questionNl: 'Avontuur of Stabiliteit?',
    emoji: '🎢🏡',
    options: [
      { value: 'adventure', label: 'Avontuur', emoji: '🎢' },
      { value: 'stability', label: 'Stabiliteit', emoji: '🏡' },
    ],
    vectorTag: 'life-priority',
    category: 'values',
    weight: 1.8,
    priority: 10,
  },
  {
    question: 'Career focused or Work-life balance?',
    questionNl: 'Carrière of Balans?',
    emoji: '💼⚖️',
    options: [
      { value: 'career', label: 'Carrière', emoji: '💼' },
      { value: 'balance', label: 'Balans', emoji: '⚖️' },
    ],
    vectorTag: 'work-attitude',
    category: 'values',
    weight: 1.5,
    priority: 9,
  },
  {
    question: 'Save or Spend?',
    questionNl: 'Sparen of Uitgeven?',
    emoji: '🏦💸',
    options: [
      { value: 'save', label: 'Sparen', emoji: '🏦' },
      { value: 'spend', label: 'Uitgeven', emoji: '💸' },
    ],
    vectorTag: 'money-attitude',
    category: 'values',
    weight: 1.3,
    priority: 7,
  },

  // Relationship
  {
    question: 'Quality time or Space?',
    questionNl: 'Samen tijd of Eigen ruimte?',
    emoji: '💑🧘',
    options: [
      { value: 'together', label: 'Samen tijd', emoji: '💑' },
      { value: 'space', label: 'Eigen ruimte', emoji: '🧘' },
    ],
    vectorTag: 'relationship-balance',
    category: 'values',
    weight: 2.0,
    priority: 10,
  },
  {
    question: 'Big wedding or Small intimate ceremony?',
    questionNl: 'Groot feest of Klein en intiem?',
    emoji: '👰🥂',
    options: [
      { value: 'big', label: 'Groot feest', emoji: '👰' },
      { value: 'small', label: 'Klein en intiem', emoji: '🥂' },
    ],
    vectorTag: 'wedding-style',
    category: 'values',
    weight: 1.0,
    priority: 3,
  },
];

async function seedPrompts() {
  console.log('🌱 Seeding Daily Prompts...\n');

  for (const prompt of dailyPrompts) {
    try {
      const created = await prisma.dailyPrompt.upsert({
        where: {
          id: `prompt-${prompt.vectorTag}`,
        },
        create: {
          id: `prompt-${prompt.vectorTag}`,
          ...prompt,
        },
        update: prompt,
      });

      console.log(`✅ ${created.questionNl}`);
    } catch (error) {
      console.error(`❌ Error seeding "${prompt.questionNl}":`, error);
    }
  }

  console.log('\n✨ Seeding complete!');
}

seedPrompts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
