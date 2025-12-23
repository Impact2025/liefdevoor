import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/profiling/bonus-questions
 *
 * Fetch 3-5 unanswered prompts for the BonusProfileBooster.
 * These are shown when the swipe deck is empty.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get prompt IDs the user has already answered
    const answeredPromptIds = await prisma.userPromptAnswer.findMany({
      where: { userId },
      select: { promptId: true },
    });

    const answeredIds = answeredPromptIds.map(a => a.promptId);

    // Fetch 5 unanswered active prompts
    const prompts = await prisma.dailyPrompt.findMany({
      where: {
        isActive: true,
        id: { notIn: answeredIds },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
      take: 5,
    });

    if (prompts.length === 0) {
      return NextResponse.json({
        questions: [],
        message: 'Alle vragen beantwoord!',
      });
    }

    // Transform to simpler format
    const questions = prompts.map(prompt => ({
      id: prompt.id,
      question: prompt.questionNl || prompt.question,
      emoji: prompt.emoji || '💭',
      options: prompt.options as Array<{
        value: string;
        label: string;
        emoji: string;
      }>,
    }));

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error fetching bonus questions:', error);
    return NextResponse.json(
      { error: 'Kon vragen niet laden' },
      { status: 500 }
    );
  }
}
