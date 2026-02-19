import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const users = [
        {
            email: "dina@test.com",
            name: "Dina",
            videoPath: "/video/dina.mp4",
            gender: "female",
            id: "dina-seeded-id",
        },
        {
            email: "hila@test.com",
            name: "Hila",
            videoPath: "/video/hila.mp4",
            gender: "female",
            id: "hila-seeded-id",
        },
    ];

    console.log("Starting video seeding...");

    for (const user of users) {
        console.log(`Processing user: ${user.email}`);
        const hashedPassword = await bcrypt.hash("password", 10);

        // Upsert User
        const dbUser = await prisma.user.upsert({
            where: { email: user.email },
            update: {
                profileComplete: true,
                emailVerified: new Date(),
                // Keep existing password if possible, or reset to 'password'
            },
            create: {
                email: user.email,
                name: user.name,
                passwordHash: hashedPassword,
                profileComplete: true,
                emailVerified: new Date(),
                image: "/images/user.png", // Default image
            },
        });

        // Upsert Member
        const dbMember = await prisma.member.upsert({
            where: { userId: dbUser.id },
            update: {
                videoUrl: user.videoPath,
                videoUploadedAt: new Date(),
            },
            create: {
                userId: dbUser.id,
                name: user.name,
                dateOfBirth: new Date("1995-01-01"), // Default DOB
                gender: user.gender,
                description: `Hi I'm ${user.name}! check out my video!`,
                city: "Tel Aviv",
                country: "Israel",
                videoUrl: user.videoPath,
                videoUploadedAt: new Date(),
            },
        });

        // Handle Video Model (Delete old, create new)
        await prisma.video.deleteMany({
            where: { memberId: dbMember.id },
        });

        await prisma.video.create({
            data: {
                url: user.videoPath,
                memberId: dbMember.id,
                isApproved: true,
            },
        });

        console.log(`✅ Seeded video for ${user.name} (${user.email}) -> ${user.videoPath}`);
    }

    console.log("Seeding finished.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
