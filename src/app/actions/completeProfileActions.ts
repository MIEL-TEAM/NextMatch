"use server";

import { auth } from "@/auth";
import { CompleteProfileWithPasswordSchema } from "@/lib/schemas/completeProfileSchema";
import { ProfileSchema, RegisterSchema } from "@/lib/schemas/registerSchema";
import { ActionResult } from "@/types";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function completeEmailRegistrationProfile(
  data: (CompleteProfileWithPasswordSchema | RegisterSchema) & {
    email?: string;
  }
): Promise<ActionResult<string>> {
  try {
    // Try to get session first
    const session = await auth();
    let userEmail = session?.user?.email;

    // If no session, use email from data (from localStorage)
    if (!userEmail && data.email) {
      userEmail = data.email;
    }

    if (!userEmail) {
      return { status: "error", error: "לא נמצא אימייל משתמש" };
    }

    // Find user by email
    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        passwordHash: true,
        accounts: true,
        emailVerified: true,
      },
    });

    if (!existingUser) {
      return { status: "error", error: "משתמש לא נמצא" };
    }

    // Security check: Email must be verified
    if (!existingUser.emailVerified) {
      return { status: "error", error: "יש לאמת את המייל תחילה" };
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    // Extract photos if they exist
    const hasPhotos = "photos" in data && Array.isArray(data.photos);
    const photos = hasPhotos ? (data as RegisterSchema).photos : [];
    const primaryImage =
      photos && photos.length > 0 ? photos[0].url : "/images/user.png";

    // Create user and member
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name: data.name,
        passwordHash,
        profileComplete: true,
        image: primaryImage,
        member: {
          create: {
            name: data.name,
            gender: data.gender,
            dateOfBirth: new Date(data.dateOfBirth),
            description: data.description,
            city: data.city,
            country: data.country,
            image: primaryImage,
            ...(photos &&
              photos.length > 0 && {
                photos: {
                  create: photos.map((photo) => ({
                    url: photo.url,
                    publicId: photo.publicId,
                    isApproved: true,
                  })),
                },
              }),
          },
        },
      },
    });

    // TODO: Handle preferences (preferredGenders, preferredAgeMin, preferredAgeMax) in a separate flow
    // The preferences data exists in the form but needs to be mapped to the correct Prisma schema

    return { status: "success", data: "email" };
  } catch (error) {
    console.error(
      "[COMPLETE_PROFILE] Email registration profile completion failed:",
      error
    );
    return { status: "error", error: "אירעה שגיאה בהשלמת הפרופיל" };
  }
}

export async function completeOAuthProfile(
  data: ProfileSchema
): Promise<ActionResult<string>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", error: "משתמש לא מחובר" };
  }

  try {
    const userId = session.user.id;

    // Get existing user data (OAuth verified, image, etc.)
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        emailVerified: true,
        oauthVerified: true,
        image: true,
        accounts: { select: { provider: true } },
      },
    });

    if (!existingUser) {
      return { status: "error", error: "משתמש לא נמצא" };
    }

    // Update user + create/update member
    await prisma.user.update({
      where: { id: userId },
      data: {
        profileComplete: true,
        emailVerified: existingUser.emailVerified || new Date(),
        member: {
          upsert: {
            create: {
              name: session.user.name as string,
              image: existingUser.image || session.user.image,
              gender: data.gender,
              dateOfBirth: new Date(data.dateOfBirth),
              description: data.description,
              city: data.city,
              country: data.country,
            },
            update: {
              gender: data.gender,
              dateOfBirth: new Date(data.dateOfBirth),
              description: data.description,
              city: data.city,
              country: data.country,
              image: existingUser.image || session.user.image,
            },
          },
        },
      },
    });

    const provider = existingUser.accounts[0]?.provider || "google";
    return { status: "success", data: provider };
  } catch (error) {
    console.error("[COMPLETE_PROFILE] OAuth profile completion failed:", error);
    return { status: "error", error: "אירעה שגיאה בהשלמת הפרופיל" };
  }
}
