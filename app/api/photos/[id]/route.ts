import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * DELETE /api/photos/[id] - Delete a specific photo
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const photoId = params.id

    // Check if photo belongs to user
    const photo = await prisma.photo.findFirst({
      where: { id: photoId, userId: user.id }
    })

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found or unauthorized' }, { status: 404 })
    }

    // Delete the photo
    await prisma.photo.delete({
      where: { id: photoId }
    })

    // Reorder remaining photos to be sequential
    const remainingPhotos = await prisma.photo.findMany({
      where: { userId: user.id },
      orderBy: { order: 'asc' }
    })

    // Update orders to be sequential
    for (let i = 0; i < remainingPhotos.length; i++) {
      await prisma.photo.update({
        where: { id: remainingPhotos[i].id },
        data: { order: i }
      })
    }

    return NextResponse.json({ success: true, message: 'Photo deleted successfully' })
  } catch (error) {
    console.error('Error deleting photo:', error)
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 })
  }
}
