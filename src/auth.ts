import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import authConfig from "./auth.config";
import { prisma } from "./lib/prisma";
import { Role } from "@prisma/client";
import { sendWelcomeEmail } from "./lib/mail";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma) as any,

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  jwt: {
    maxAge: 24 * 60 * 60,
  },

  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60,
      },
    },
  },

  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return true;

      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: {
            hasSeenWelcomeMessage: true,
            oauthVerified: true,
            trustScore: true,
          },
        });

        // ✅ Handle OAuth providers (Google, Facebook)
        if (
          account?.provider === "google" ||
          account?.provider === "facebook"
        ) {
          const updateData: any = {
            emailVerified: new Date(),
            provider: account.provider,
            oauthVerified: true,
          };

          // Increase trust score for first OAuth verification
          if (existingUser && !existingUser.oauthVerified) {
            updateData.trustScore = (existingUser.trustScore || 0) + 40;
          }

          // Send welcome email for new Google users
          if (
            account.provider === "google" &&
            existingUser &&
            !existingUser.hasSeenWelcomeMessage
          ) {
            updateData.hasSeenWelcomeMessage = true;
            try {
              await sendWelcomeEmail(user.email, user.name || "חבר חדש");
            } catch (err) {
              console.error("Failed to send welcome email:", err);
            }
          }

          await prisma.user.update({
            where: { email: user.email },
            data: updateData,
          });
        }

        // ✅ Handle Credentials provider (email/password)
        if (account?.provider === "credentials") {
          await prisma.user.update({
            where: { email: user.email },
            data: {
              provider: "credentials",
              oauthVerified: false,
            },
          });
        }
      } catch (err) {
        console.error("[AUTH] Sign-in error:", err);
      }

      return true;
    },

    async jwt({ token, user, trigger }) {
      if (user) {
        token.profileComplete = user.profileComplete;
        token.role = user.role;
        token.isPremium = user.isPremium;
        token.gender = (user as any).member?.gender ?? null;
      }

      if (trigger === "update" && token.sub) {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            profileComplete: true,
            role: true,
            isPremium: true,
            member: {
              select: {
                gender: true,
              },
            },
          },
        });

        if (freshUser) {
          token.profileComplete = freshUser.profileComplete;
          token.role = freshUser.role;
          token.isPremium = freshUser.isPremium;
          token.gender = freshUser.member?.gender ?? null;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.profileComplete = token.profileComplete as boolean;
        session.user.role = token.role as Role;
        session.user.isPremium = token.isPremium as boolean;
        session.user.gender = token.gender as string | null | undefined;
      }
      return session;
    },
  },

  ...authConfig,

  pages: {
    signIn: "/login",
    error: "/login",
  },
});
