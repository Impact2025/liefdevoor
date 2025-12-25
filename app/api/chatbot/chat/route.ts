import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import {
  searchFAQArticles,
  generateChatbotResponse,
  isGreeting,
  getGreetingResponse
} from '@/lib/chatbot-ai'
import { auditLog, getClientInfo } from '@/lib/audit'

const chatMessageSchema = z.object({
  conversationId: z.string().nullable().optional(),
  message: z.preprocess(
    (val) => (val === null || val === undefined ? '' : val),
    z.string().min(1, 'Bericht is verplicht').max(1000)
  )
})

// POST /api/chatbot/chat - Send message to chatbot
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    // Validate input
    const validation = chatMessageSchema.safeParse(body)
    if (!validation.success) {
      const firstError = validation.error.issues[0]
      return NextResponse.json(
        { success: false, error: firstError.message, field: firstError.path[0] },
        { status: 400 }
      )
    }

    const { conversationId, message } = validation.data

    // Get or create conversation
    let conversation
    if (conversationId) {
      conversation = await prisma.chatbotConversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 20 // Last 20 messages for context
          }
        }
      })

      if (!conversation || conversation.userId !== user.id) {
        return NextResponse.json(
          { success: false, error: 'Conversatie niet gevonden' },
          { status: 404 }
        )
      }
    }

    if (!conversation) {
      conversation = await prisma.chatbotConversation.create({
        data: {
          userId: user.id,
          status: 'active'
        },
        include: {
          messages: true
        }
      })

      // Audit log
      const clientInfo = getClientInfo(request)
      auditLog('CHATBOT_CONVERSATION_STARTED', {
        userId: user.id,
        ip: clientInfo.ip,
        userAgent: clientInfo.userAgent,
        details: {
          conversationId: conversation.id
        }
      })
    }

    // Save user message
    await prisma.chatbotMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message
      }
    })

    // Check for greeting
    if (isGreeting(message) && conversation.messages.length === 0) {
      const greetingResponse = getGreetingResponse()

      const assistantMessage = await prisma.chatbotMessage.create({
        data: {
          conversationId: conversation.id,
          role: 'assistant',
          content: greetingResponse,
          wasAIGenerated: false
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          conversationId: conversation.id,
          message: assistantMessage,
          suggestedArticles: [],
          canEscalate: false
        }
      })
    }

    // Search FAQ for relevant articles
    const relevantArticles = await searchFAQArticles(message)

    // Generate AI response
    const aiResponse = await generateChatbotResponse({
      userMessage: message,
      conversationHistory: conversation.messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      relevantArticles
    })

    // Save AI message
    const assistantMessage = await prisma.chatbotMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: aiResponse.message,
        wasAIGenerated: true,
        suggestedArticles: aiResponse.suggestedArticleIds
      }
    })

    // Track FAQ usage
    if (aiResponse.suggestedArticleIds.length > 0) {
      await prisma.chatbotFAQUsage.createMany({
        data: aiResponse.suggestedArticleIds.map(articleId => ({
          conversationId: conversation.id,
          articleId
        })),
        skipDuplicates: true
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        conversationId: conversation.id,
        message: assistantMessage,
        suggestedArticles: relevantArticles.slice(0, 3), // Top 3
        canEscalate: aiResponse.suggestEscalation
      }
    })
  } catch (error: any) {
    console.error('Error in chatbot:', error)

    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { success: false, error: 'Niet geautoriseerd' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Er is een fout opgetreden in de chatbot' },
      { status: 500 }
    )
  }
}
