"use server";

import { prisma } from "@/lib/prisma";
import {
  combinedRegisterSchema,
  ProfileSchema,
  RegisterSchema,
} from "@/lib/schemas/registerSchema";
import bcrypt from "bcryptjs";
import { ActionResult } from "@/types";
import { TokenType, User } from "@prisma/client";
import { LoginSchema } from "@/lib/schemas/loginSchema";
import { auth, signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { generateToken, getTokenByToken } from "@/lib/tokens";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/mail";
import { revalidatePath } from "next/cache";

export async function signInUser(
  data: LoginSchema
): Promise<ActionResult<string>> {
  try {
    // Let NextAuth handle the user validation in auth.config.ts
    // This eliminates the duplicate getUserByEmail call
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    console.log(result);
    return { status: "success", data: "Logged in" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          // Extract the actual error message from auth.config.ts
          return {
            status: "error",
            error: error.cause?.err?.message || "פרטי התחברות שגויים",
          };
        default:
          return { status: "error", error: "הייתה תקלה, ננסה שוב?" };
      }
    } else {
      return { status: "error", error: "הייתה תקלה, ננסה שוב?" };
    }
  }
}

export async function signOutUser() {
  await signOut({ redirectTo: "/" });
}

export async function registerUser(
  data: RegisterSchema
): Promise<ActionResult<User>> {
  try {
    const validated = combinedRegisterSchema.safeParse(data);

    if (!validated.success) {
      return { status: "error", error: validated.error.errors };
    }

    const {
      name,
      email,
      password,
      gender,
      description,
      dateOfBirth,
      country,
      city,
      photos,
      preferredGenders,
      preferredAgeMin,
      preferredAgeMax,
    } = validated.data;
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { status: "error", error: "User already exists" };
    }

    // Check for exactly 3 photos
    if (!photos || photos.length !== 3) {
      return {
        status: "error",
        error: "יש להעלות בדיוק 3 תמונות",
      };
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        profileComplete: true,
        image: photos[0].url, // Set first photo as main profile image
        // Save user preferences
        preferredGenders,
        preferredAgeMin,
        preferredAgeMax,
        member: {
          create: {
            name,
            description,
            city,
            country,
            dateOfBirth: new Date(dateOfBirth),
            gender,
            image: photos[0].url, // Set first photo as main profile image
            // Create photos
            photos: {
              create: photos.map((photo) => ({
                url: photo.url,
                publicId: photo.publicId,
                isApproved: false, // Photos need approval by default
              })),
            },
          },
        },
      },
    });

    const verificationToken = await generateToken(
      email,
      TokenType.VERIFICATION
    );

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );

    return { status: "success", data: user };
  } catch (error) {
    console.log(error);
    return { status: "error", error: " Something went wrong" };
  }
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getAuthUserId() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) throw new Error("Unauthorized");

  return userId;
}

export async function verifyEmail(
  token: string
): Promise<ActionResult<string>> {
  try {
    const existingToken = await getTokenByToken(token);

    if (!existingToken) {
      return {
        status: "error",
        error: "משהו פה לא מסתדר... נסה שוב ותן לנו צ'אנס! 💘",
      };
    }

    const hasExpired = new Date() > existingToken.expires;

    if (hasExpired) {
      return { status: "error", error: "Token has expired" };
    }

    const existingUser = await getUserByEmail(existingToken.email);
    if (!existingUser) {
      return { status: "error", error: "User not found" };
    }

    await prisma.user.update({
      where: { id: existingUser.id },
      data: { emailVerified: new Date() },
    });

    await prisma.token.delete({ where: { id: existingToken.id } });

    return { status: "success", data: "אתה בפנים!" };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function generateResetPasswordEmail(
  email: string
): Promise<ActionResult<string>> {
  try {
    const existingUser = await getUserByEmail(email);
    if (!existingUser) {
      return { status: "error", error: "האימייל לא נמצא במערכת" };
    }

    const token = await generateToken(email, TokenType.PASSWORD_RESET);

    await sendPasswordResetEmail(token.email, token.token);

    return {
      status: "success",
      data: "אימייל לאיפוס סיסמה נשלח, אנא בדוק את תיבת הדואר שלך",
    };
  } catch (error) {
    console.log(error);
    return {
      status: "error",
      error: "שגיאה בעת שליחת האימייל, אנא נסה שוב מאוחר יותר",
    };
  }
}
export async function resetPassword(
  password: string,
  token: string | null
): Promise<ActionResult<string>> {
  try {
    if (!token)
      return {
        status: "error",
        error: "משהו פה לא מסתדר... נסה שוב ותן לנו צ'אנס! 💘",
      };

    const existingToken = await getTokenByToken(token);

    if (!existingToken) {
      return {
        status: "error",
        error: "משהו פה לא מסתדר... נסה שוב ותן לנו צ'אנס! 💘",
      };
    }

    const hasExpired = new Date() > existingToken.expires;

    if (hasExpired) {
      return { status: "error", error: "תוקף הקישור פג" };
    }

    const existingUser = await getUserByEmail(existingToken.email);
    if (!existingUser) {
      return { status: "error", error: "המשתמש לא נמצא במערכת" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: existingUser.id },
      data: { passwordHash: hashedPassword },
    });

    await prisma.token.delete({
      where: { id: existingToken.id },
    });

    return {
      status: "success",
      data: "הסיסמה עודכנה בהצלחה, אנא התחבר/י מחדש כעת",
    };
  } catch (error) {
    console.log(error);
    return { status: "error", error: "משהו השתבש, אנא נסה שוב מאוחר יותר" };
  }
}

export async function completeSocialLoginProfile(
  data: ProfileSchema
): Promise<ActionResult<string>> {
  const session = await auth();
  if (!session?.user) return { status: "error", error: "user not found" };

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        profileComplete: true,
        member: {
          create: {
            name: session.user.name as string,
            image: session.user.image,
            gender: data.gender,
            dateOfBirth: new Date(data.dateOfBirth),
            description: data.description,
            city: data.city,
            country: data.country,
            // Removed Interest_MemberInterests
          },
        },
      },
      include: {
        accounts: {
          select: {
            provider: true,
          },
        },
      },
    });

    return { status: "success", data: user.accounts[0].provider };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserRole() {
  const session = await auth();
  const role = session?.user.role;

  if (!role) throw new Error("Not in role");

  return role;
}

export async function setProfileIncomplete() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      profileComplete: false,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/members");

  return { success: true };
}
