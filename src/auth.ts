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

        if (
          account?.provider === "google" ||
          account?.provider === "facebook"
        ) {
          const updateData: any = {
            emailVerified: new Date(),
            provider: account.provider,
            oauthVerified: true,
          };

          if (existingUser && !existingUser.oauthVerified) {
            updateData.trustScore = (existingUser.trustScore || 0) + 40;
          }

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
        console.error("signIn error:", err);
        // Still allow sign in even if DB update fails
      }

      return true;
    },

    async jwt({ token, user }) {
      // Initial sign in - user object exists
      if (user) {
        token.profileComplete = user.profileComplete;
        token.role = user.role;
        token.isPremium = user.isPremium;
      }

      // Subsequent requests - preserve existing token data
      // This ensures token properties persist across requests
      return token;
    },

    async session({ session, token }) {
      // ✅ Safely assign user ID with fallback
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.profileComplete = token.profileComplete as boolean;
        session.user.role = token.role as Role;
        session.user.isPremium = token.isPremium as boolean;
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
