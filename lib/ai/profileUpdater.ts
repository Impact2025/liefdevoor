/**
 * Semantic Update Engine
 *
 * Updates user's profile vector embeddings for AI matching.
 * Triggered when:
 * - User answers a Daily Prompt
 * - User updates their bio
 * - User completes onboarding
 *
 * The embedding captures semantic meaning of:
 * - Bio text
 * - Answered prompt tags
 * - Interests
 * - Lifestyle choices
 */

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * Main function to update a user's profile vector
 *
 * This combines:
 * - Bio text
 * - Answered prompt tags
 * - Interests
 * - Psych profile data
 *
 * Into a single semantic embedding for AI matching.
 */
export async function updateUserVector(userId: string): Promise<void> {
  try {
    console.log(`[ProfileUpdater] Starting vector update for user ${userId}`);

    // 1. Fetch all relevant user data
    const userData = await fetchUserProfileData(userId);

    if (!userData) {
      console.warn(`[ProfileUpdater] User ${userId} not found`);
      return;
    }

    // 2. Build the semantic profile string
    const semanticProfile = buildSemanticProfile(userData);

    // 3. Hash to detect changes (avoid unnecessary API calls)
    const profileHash = hashString(semanticProfile);

    // 4. Check if embedding needs update
    const existingEmbedding = await prisma.userEmbedding.findUnique({
      where: { userId },
    });

    if (existingEmbedding?.bioHash === profileHash) {
      console.log(`[ProfileUpdater] No changes detected for user ${userId}`);
      return;
    }

    // 5. Generate embedding (mock for now, replace with actual API call)
    const embedding = await generateEmbedding(semanticProfile);

    // 6. Derive semantic tags from the profile
    const derivedTags = deriveSemanticTags(userData);

    // 7. Save to database
    await prisma.userEmbedding.upsert({
      where: { userId },
      create: {
        userId,
        embedding,
        bioHash: profileHash,
        enrichedEmbedding: embedding,
        enrichedAt: new Date(),
        derivedTags,
      },
      update: {
        embedding,
        bioHash: profileHash,
        enrichedEmbedding: embedding,
        enrichedAt: new Date(),
        derivedTags,
      },
    });

    // 8. Update user's semantic tags
    await prisma.user.update({
      where: { id: userId },
      data: {
        semanticTags: derivedTags,
      },
    });

    console.log(`[ProfileUpdater] Successfully updated vector for user ${userId}`);
  } catch (error) {
    console.error(`[ProfileUpdater] Error updating vector for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Fetch all profile data needed for embedding
 */
async function fetchUserProfileData(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      bio: true,
      interests: true,
      occupation: true,
      education: true,
      drinking: true,
      smoking: true,
      children: true,
      lookingFor: true,
      semanticTags: true,
      psychProfile: {
        select: {
          introvertScale: true,
          emotionalScale: true,
          spontaneityScale: true,
          adventureScale: true,
          conflictStyle: true,
          communicationStyle: true,
          familyImportance: true,
          careerImportance: true,
          socialImportance: true,
          loveLangWords: true,
          loveLangTime: true,
          loveLangGifts: true,
          loveLangActs: true,
          loveLangTouch: true,
          attachmentStyle: true,
          wantsChildren: true,
          relationshipGoal: true,
        },
      },
      promptAnswers: {
        select: {
          answer: true,
          answerLabel: true,
          prompt: {
            select: {
              vectorTag: true,
              category: true,
              weight: true,
            },
          },
        },
      },
    },
  });
}

type UserProfileData = NonNullable<Awaited<ReturnType<typeof fetchUserProfileData>>>;

/**
 * Build a semantic profile string from user data
 *
 * This string will be converted to an embedding vector.
 */
function buildSemanticProfile(userData: UserProfileData): string {
  const parts: string[] = [];

  // Bio (most important for text matching)
  if (userData.bio) {
    parts.push(`Bio: ${userData.bio}`);
  }

  // Interests
  if (userData.interests) {
    parts.push(`Interests: ${userData.interests}`);
  }

  // Occupation & Education
  if (userData.occupation) {
    parts.push(`Works as: ${userData.occupation}`);
  }
  if (userData.education) {
    parts.push(`Education: ${userData.education}`);
  }

  // Lifestyle
  if (userData.drinking) parts.push(`Drinking: ${userData.drinking}`);
  if (userData.smoking) parts.push(`Smoking: ${userData.smoking}`);
  if (userData.children) parts.push(`Children: ${userData.children}`);

  // Psych Profile
  if (userData.psychProfile) {
    const psych = userData.psychProfile;

    // Personality traits
    if (psych.introvertScale) {
      parts.push(psych.introvertScale > 5 ? 'Extravert' : 'Introvert');
    }
    if (psych.spontaneityScale) {
      parts.push(psych.spontaneityScale > 5 ? 'Spontaneous' : 'Planner');
    }
    if (psych.adventureScale) {
      parts.push(psych.adventureScale > 5 ? 'Adventurous' : 'Routine-oriented');
    }

    // Relationship goal (very important)
    if (psych.relationshipGoal) {
      parts.push(`Relationship goal: ${psych.relationshipGoal}`);
    }

    // Conflict style
    if (psych.conflictStyle) {
      parts.push(`Conflict style: ${psych.conflictStyle}`);
    }

    // Communication
    if (psych.communicationStyle) {
      parts.push(`Communication: ${psych.communicationStyle}`);
    }

    // Love languages (top 2)
    const loveLangs = [
      { name: 'words of affirmation', score: psych.loveLangWords || 0 },
      { name: 'quality time', score: psych.loveLangTime || 0 },
      { name: 'gifts', score: psych.loveLangGifts || 0 },
      { name: 'acts of service', score: psych.loveLangActs || 0 },
      { name: 'physical touch', score: psych.loveLangTouch || 0 },
    ].sort((a, b) => b.score - a.score);

    if (loveLangs[0].score > 0) {
      parts.push(`Primary love language: ${loveLangs[0].name}`);
    }
    if (loveLangs[1].score > 0) {
      parts.push(`Secondary love language: ${loveLangs[1].name}`);
    }
  }

  // Prompt answers (tagged preferences)
  userData.promptAnswers.forEach(answer => {
    if (answer.answerLabel && answer.prompt?.vectorTag) {
      parts.push(`${answer.prompt.vectorTag}: ${answer.answerLabel}`);
    }
  });

  // Semantic tags (from previous interactions)
  if (userData.semanticTags.length > 0) {
    parts.push(`Tags: ${userData.semanticTags.join(', ')}`);
  }

  return parts.join('. ');
}

/**
 * Generate embedding vector from text
 *
 * In production, this would call OpenAI's embedding API or similar.
 * For now, we create a mock embedding.
 */
async function generateEmbedding(text: string): Promise<number[]> {
  // Check if we have an OpenAI API key
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small', // Cheaper, still effective
          input: text,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.data[0].embedding;
      }
    } catch (error) {
      console.warn('[ProfileUpdater] OpenAI embedding failed, using mock:', error);
    }
  }

  // Fallback: Create a mock embedding based on text hash
  // This preserves some semantic meaning through consistent hashing
  console.log('[ProfileUpdater] Using mock embedding (no OpenAI key)');
  return createMockEmbedding(text);
}

/**
 * Create a mock embedding for development/testing
 *
 * Uses text characteristics to create a somewhat meaningful vector.
 */
function createMockEmbedding(text: string): number[] {
  const dimensions = 1536; // Match OpenAI's dimensions
  const embedding: number[] = new Array(dimensions).fill(0);

  // Normalize text
  const normalized = text.toLowerCase();

  // Use hash to seed pseudo-random values
  const hash = crypto.createHash('sha256').update(normalized).digest('hex');

  // Fill embedding with pseudo-random values seeded by text
  for (let i = 0; i < dimensions; i++) {
    const hashIndex = i % 64;
    const hashByte = parseInt(hash.substring(hashIndex * 2, hashIndex * 2 + 2), 16);
    embedding[i] = (hashByte / 255) * 2 - 1; // Normalize to [-1, 1]
  }

  // Add some semantic signals based on keywords
  const keywords: Record<string, number> = {
    adventurous: 10,
    outdoor: 20,
    travel: 30,
    family: 40,
    career: 50,
    creative: 60,
    sports: 70,
    music: 80,
    cooking: 90,
    reading: 100,
  };

  Object.entries(keywords).forEach(([keyword, index]) => {
    if (normalized.includes(keyword)) {
      embedding[index] = 0.9;
    }
  });

  return embedding;
}

/**
 * Derive human-readable semantic tags from user data
 */
function deriveSemanticTags(userData: UserProfileData): string[] {
  const tags: string[] = [];

  // From psych profile
  if (userData.psychProfile) {
    const psych = userData.psychProfile;

    if (psych.introvertScale && psych.introvertScale > 7) tags.push('social-butterfly');
    if (psych.introvertScale && psych.introvertScale < 4) tags.push('homebody');
    if (psych.adventureScale && psych.adventureScale > 7) tags.push('adventure-seeker');
    if (psych.spontaneityScale && psych.spontaneityScale > 7) tags.push('spontaneous');
    if (psych.spontaneityScale && psych.spontaneityScale < 4) tags.push('planner');

    if (psych.relationshipGoal === 'serious') tags.push('looking-for-serious');
    if (psych.relationshipGoal === 'marriage') tags.push('marriage-minded');
    if (psych.relationshipGoal === 'casual') tags.push('casual-dater');

    if (psych.familyImportance && psych.familyImportance > 7) tags.push('family-oriented');
    if (psych.careerImportance && psych.careerImportance > 7) tags.push('career-focused');
  }

  // From bio keywords
  if (userData.bio) {
    const bio = userData.bio.toLowerCase();
    if (bio.includes('travel')) tags.push('travel-lover');
    if (bio.includes('sport') || bio.includes('fitness')) tags.push('fitness-enthusiast');
    if (bio.includes('music') || bio.includes('concert')) tags.push('music-lover');
    if (bio.includes('cook') || bio.includes('food')) tags.push('foodie');
    if (bio.includes('hik') || bio.includes('natuur')) tags.push('nature-lover');
    if (bio.includes('read') || bio.includes('book')) tags.push('bookworm');
    if (bio.includes('film') || bio.includes('movie') || bio.includes('serie')) tags.push('film-buff');
  }

  // From prompt answers
  userData.promptAnswers.forEach(answer => {
    if (answer.prompt?.vectorTag && answer.answer) {
      tags.push(`${answer.prompt.vectorTag}-${answer.answer}`);
    }
  });

  // Deduplicate and limit
  return Array.from(new Set(tags)).slice(0, 20);
}

/**
 * Calculate similarity between two users based on embeddings
 */
export async function calculateSemanticSimilarity(
  userId1: string,
  userId2: string
): Promise<number> {
  try {
    const [embedding1, embedding2] = await Promise.all([
      prisma.userEmbedding.findUnique({ where: { userId: userId1 } }),
      prisma.userEmbedding.findUnique({ where: { userId: userId2 } }),
    ]);

    if (!embedding1?.embedding || !embedding2?.embedding) {
      return 0;
    }

    // Use enriched embeddings if available
    const vec1 = (embedding1.enrichedEmbedding || embedding1.embedding) as number[];
    const vec2 = (embedding2.enrichedEmbedding || embedding2.embedding) as number[];

    return cosineSimilarity(vec1, vec2);
  } catch (error) {
    console.error('Error calculating semantic similarity:', error);
    return 0;
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) return 0;

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }

  if (norm1 === 0 || norm2 === 0) return 0;

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

/**
 * Hash string for change detection
 */
function hashString(text: string): string {
  return crypto.createHash('md5').update(text).digest('hex');
}

/**
 * Batch update vectors for multiple users (for background processing)
 */
export async function batchUpdateVectors(userIds: string[]): Promise<void> {
  console.log(`[ProfileUpdater] Starting batch update for ${userIds.length} users`);

  for (const userId of userIds) {
    try {
      await updateUserVector(userId);
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`[ProfileUpdater] Batch error for user ${userId}:`, error);
    }
  }

  console.log(`[ProfileUpdater] Batch update completed`);
}
