import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/photos - Get user's photos
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const photos = await prisma.photo.findMany({
      where: { userId: user.id },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
  }
}

// DELETE /api/photos?id=photoId - Delete a photo
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('id');

    if (!photoId) {
      return NextResponse.json({ error: 'Photo ID required' }, { status: 400 });
    }

    // Check if photo belongs to user
    const photo = await prisma.photo.findFirst({
      where: { id: photoId, userId: user.id }
    });

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Delete the photo
    await prisma.photo.delete({
      where: { id: photoId }
    });

    // Reorder remaining photos
    const remainingPhotos = await prisma.photo.findMany({
      where: { userId: user.id },
      orderBy: { order: 'asc' }
    });

    // Update orders to be sequential
    for (let i = 0; i < remainingPhotos.length; i++) {
      await prisma.photo.update({
        where: { id: remainingPhotos[i].id },
        data: { order: i }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}

// PUT /api/photos - Reorder photos or set main photo
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { action, photoId, newOrder } = body;

    if (action === 'reorder' && Array.isArray(newOrder)) {
      // Reorder photos
      for (let i = 0; i < newOrder.length; i++) {
        await prisma.photo.update({
          where: { id: newOrder[i], userId: user.id },
          data: { order: i }
        });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'setMain' && photoId) {
      // Set main profile picture
      await prisma.user.update({
        where: { id: user.id },
        data: { profileImage: photoId }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating photos:', error);
    return NextResponse.json({ error: 'Failed to update photos' }, { status: 500 });
  }
}