import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SAMPLE_TEXTS = [
  "Hey 👋",
  "מה קורה?",
  "Hi Alamayo!",
  "Nice to meet you 🙂",
  "שלחתי לך הודעה",
  "Hello!",
  "איך הולך?",
  "Shalom!",
  "היי, אפשר לדבר?",
  "Heyy, saw your profile!",
];

function randomText(): string {
  return SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];
}

function randomCreatedAt(): Date {
  // Random timestamp within the last 5 days
  return new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 5);
}

async function main() {
  const alamayoUser = await prisma.user.findUnique({
    where: { email: "alamayo274@gmail.com" },
    select: { id: true },
  });

  if (!alamayoUser) {
    throw new Error("User alamayo274@gmail.com not found");
  }

  const otherMembers = await prisma.member.findMany({
    where: {
      userId: { not: alamayoUser.id },
    },
    select: { userId: true },
  });

  const alamayo = { userId: alamayoUser.id };

  if (otherMembers.length === 0) {
    console.log("No other users found — nothing to seed.");
    return;
  }

  await Promise.all(
    otherMembers.map((member) =>
      prisma.message.create({
        data: {
          senderId: member.userId,
          recipientId: alamayo.userId,
          text: randomText(),
          created: randomCreatedAt(),
        },
      })
    )
  );

  console.log(`Seeded ${otherMembers.length} messages to Alamayo`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
