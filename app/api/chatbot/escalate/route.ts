import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { auditLog, getClientInfo } from '@/lib/audit'

const escalateSchema = z.object({
  conversationId: z.string(),
  subject: z.string().min(5, 'Onderwerp moet minimaal 5 karakters zijn').max(200),
  category: z.enum(['ACCOUNT', 'MATCHING', 'MESSAGES', 'PAYMENTS', 'VERIFICATION', 'SAFETY', 'TECHNICAL', 'FEATURE', 'OTHER'])
})

// POST /api/chatbot/escalate - Escalate conversation to ticket
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    // Validate input
    const validation = escalateSchema.safeParse(body)
    if (!validation.success) {
      const firstError = validation.error.errors[0]
      return NextResponse.json(
        { success: false, error: firstError.message, field: firstError.path[0] },
        { status: 400 }
      )
    }

    const { conversationId, subject, category } = validation.data

    // Get conversation with messages
    const conversation = await prisma.chatbotConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!conversation || conversation.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Conversatie niet gevonden' },
        { status: 404 }
      )
    }

    if (conversation.escalatedToTicket) {
      return NextResponse.json(
        { success: false, error: 'Deze conversatie is al geëscaleerd naar een ticket' },
        { status: 400 }
      )
    }

    // Create description from conversation
    const description = `Geëscaleerd vanuit chatbot conversatie:\n\n` +
      conversation.messages
        .map(m => `**${m.role === 'user' ? 'Gebruiker' : 'Chatbot'}**: ${m.content}`)
        .join('\n\n')

    // Create ticket
    const ticket = await prisma.helpDeskTicket.create({
      data: {
        userId: user.id,
        subject,
        category,
        description,
        status: 'OPEN',
        priority: 'MEDIUM',
        isEscalated: true,
        chatbotConversationId: conversationId
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Update conversation
    await prisma.chatbotConversation.update({
      where: { id: conversationId },
      data: {
        status: 'escalated',
        escalatedToTicket: true,
        ticketId: ticket.id,
        endedAt: new Date()
      }
    })

    // Audit log
    const clientInfo = getClientInfo(request)
    auditLog('CHATBOT_ESCALATED', {
      userId: user.id,
      ip: clientInfo.ip,
      userAgent: clientInfo.userAgent,
      details: {
        conversationId,
        ticketId: ticket.id,
        subject,
        category
      }
    })

    // TODO: Send email notification to user and admins

    return NextResponse.json({
      success: true,
      data: {
        ticket,
        message: 'Je vraag is doorgestuurd naar ons support team. Ze zullen zo snel mogelijk reageren.'
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error escalating chatbot:', error)

    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { success: false, error: 'Niet geautoriseerd' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Er is een fout opgetreden bij het escaleren' },
      { status: 500 }
    )
  }
}
