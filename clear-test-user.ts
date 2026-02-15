import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearTestUser() {
  const email = process.argv[2];

  if (!email) {
    process.exit(1);
  }

  try {
    await prisma.token.deleteMany({
      where: { email }
    });

    await prisma.user.deleteMany({
      where: { email }
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearTestUser();
