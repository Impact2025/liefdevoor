const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const totalUsers = await prisma.user.count();
    const usersWithImage = await prisma.user.count({
      where: { profileImage: { not: null } }
    });
    const usersWithPhotos = await prisma.photo.count();

    console.log(`Total users: ${totalUsers}`);
    console.log(`Users with profileImage: ${usersWithImage}`);
    console.log(`Total photos: ${usersWithPhotos}`);

    // Check all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        gender: true,
        city: true,
        birthDate: true,
        isVerified: true,
        _count: {
          select: { photos: true }
        }
      }
    });

    console.log('\nSample users:');
    users.forEach(user => {
      console.log(`${user.name} (${user.email}): profileImage=${user.profileImage}, photos=${user._count.photos}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();