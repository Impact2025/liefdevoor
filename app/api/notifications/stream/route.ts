import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return new Response('Unauthorized', { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!user) {
    return new Response('User not found', { status: 404 })
  }

  const responseStream = new ReadableStream({
    start(controller) {
      // Send initial data
      const sendData = async () => {
        try {
          const unreadCount = await prisma.notification.count({
            where: {
              userId: user.id,
              isRead: false,
            },
          })

          const data = `data: ${JSON.stringify({ unreadCount })}\n\n`
          controller.enqueue(new TextEncoder().encode(data))
        } catch (error) {
          console.error('Error sending notification data:', error)
        }
      }

      // Send initial data
      sendData()

      // Set up polling for updates (every 30 seconds)
      const interval = setInterval(sendData, 30000)

      // Clean up on client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
      })
    },
  })

  return new Response(responseStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}