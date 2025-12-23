import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/profiling/daily-prompt
 *
 * Fetch today's daily prompt for the user.
 * Returns null if user has already answered today.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if user answered any prompt in the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentAnswer = await prisma.userPromptAnswer.findFirst({
      where: {
        userId,
        createdAt: { gte: twentyFourHoursAgo },
      },
    });

    if (recentAnswer) {
      return NextResponse.json({
        hasAnsweredToday: true,
        prompt: null,
      });
    }

    // Get all prompt IDs the user has already answered
    const answeredPromptIds = await prisma.userPromptAnswer.findMany({
      where: { userId },
      select: { promptId: true },
    });

    const answeredIds = answeredPromptIds.map(a => a.promptId);

    // Find an active prompt the user hasn't answered yet
    const prompt = await prisma.dailyPrompt.findFirst({
      where: {
        isActive: true,
        id: { notIn: answeredIds },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    if (!prompt) {
      // User has answered all prompts!
      return NextResponse.json({
        hasAnsweredToday: false,
        prompt: null,
        allAnswered: true,
      });
    }

    return NextResponse.json({
      hasAnsweredToday: false,
      prompt: {
        id: prompt.id,
        question: prompt.question,
        questionNl: prompt.questionNl,
        emoji: prompt.emoji,
        options: prompt.options,
        vectorTag: prompt.vectorTag,
        category: prompt.category,
      },
    });
  } catch (error) {
    console.error('Error fetching daily prompt:', error);
    return NextResponse.json(
      { error: 'Kon vraag niet laden' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/profiling/daily-prompt
 *
 * Save user's answer to a daily prompt.
 * Also triggers semantic tag update.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { promptId, answer, answerLabel, responseTimeMs } = body;

    if (!promptId || !answer) {
      return NextResponse.json(
        { error: 'Prompt ID en antwoord zijn verplicht' },
        { status: 400 }
      );
    }

    // Verify prompt exists
    const prompt = await prisma.dailyPrompt.findUnique({
      where: { id: promptId },
    });

    if (!prompt) {
      return NextResponse.json(
        { error: 'Vraag niet gevonden' },
        { status: 404 }
      );
    }

    // Check if already answered
    const existingAnswer = await prisma.userPromptAnswer.findUnique({
      where: {
        userId_promptId: { userId, promptId },
      },
    });

    if (existingAnswer) {
      return NextResponse.json(
        { error: 'Je hebt deze vraag al beantwoord' },
        { status: 400 }
      );
    }

    // Save the answer
    await prisma.userPromptAnswer.create({
      data: {
        userId,
        promptId,
        answer,
        answerLabel,
        responseTimeMs,
      },
    });

    // Update user's semantic tags based on the vectorTag
    // Find which option was selected and its associated tag
    const options = prompt.options as Array<{ value: string; tag?: string }>;
    const selectedOption = options.find(o => o.value === answer);

    if (selectedOption && prompt.vectorTag) {
      // Construct the tag: e.g., "beach-lover" or "mountain-person"
      const tag = `${prompt.vectorTag}-${answer}`;

      // Add tag to user's semantic tags (avoiding duplicates)
      await prisma.user.update({
        where: { id: userId },
        data: {
          semanticTags: {
            push: tag,
          },
        },
      });
    }

    // Trigger profile vector update (async, don't block)
    triggerVectorUpdate(userId).catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'Antwoord opgeslagen!',
    });
  } catch (error) {
    console.error('Error saving prompt answer:', error);
    return NextResponse.json(
      { error: 'Kon antwoord niet opslaan' },
      { status: 500 }
    );
  }
}

/**
 * Async function to trigger profile vector update
 * This is a placeholder that will be replaced with actual embedding generation
 */
async function triggerVectorUpdate(userId: string) {
  // Import dynamically to avoid circular dependencies
  const { updateUserVector } = await import('@/lib/ai/profileUpdater');
  await updateUserVector(userId);
}
