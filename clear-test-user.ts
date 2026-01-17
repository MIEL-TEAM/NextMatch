import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearTestUser() {
  const email = process.argv[2];
  
  if (!email) {
    console.log('❌ Usage: npx tsx clear-test-user.ts your@email.com');
    process.exit(1);
  }

  try {
    // Delete verification tokens
    await prisma.token.deleteMany({
      where: { email }
    });
    console.log('✅ Deleted verification tokens for:', email);

    // Delete user
    await prisma.user.deleteMany({
      where: { email }
    });
    console.log('✅ Deleted user:', email);

    console.log('\n🎉 Done! You can now register again with this email.');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearTestUser();
