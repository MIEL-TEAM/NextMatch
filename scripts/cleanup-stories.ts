import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanupStories() {
  console.log("Deleting all stories...");
  
  const result = await prisma.story.deleteMany({});
  
  console.log(`Deleted ${result.count} stories`);
  
  await prisma.$disconnect();
}

cleanupStories()
  .catch((error) => {
    console.error("Error cleaning up stories:", error);
    process.exit(1);
  });
