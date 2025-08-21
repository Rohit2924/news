import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedUsers() {
  try {
    console.log('Seeding users...');

    // Create test users
    const users = [
      {
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
      },
      {
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      },
      {
        email: 'john@example.com',
        name: 'John Doe',
        role: 'user',
      }
    ];

    for (const userData of users) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (!existingUser) {
        const user = await prisma.user.create({
          data: userData
        });
        console.log(`Created user: ${user.email} (${user.role})`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }

    console.log('User seeding completed!');
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedUsers()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });