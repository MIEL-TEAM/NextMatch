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
  callbacks: {
    async signIn({ user, account }) {
      if (user.email) {
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
              } catch (emailError) {
                console.error("Failed to send welcome email:", emailError);
              }
            }

            await prisma.user.update({
              where: { email: user.email },
              data: updateData,
            });
          } else if (account?.provider === "credentials") {
            await prisma.user.update({
              where: { email: user.email },
              data: {
                provider: "credentials",
                oauthVerified: false,
              },
            });
          }
        } catch (error) {
          console.error("Error in signIn callback:", error);
        }
      }
      return true;
    },
    async jwt({ user, token }) {
      if (user) {
        token.profileComplete = user.profileComplete;
        token.role = user.role;
        token.isPremium = user.isPremium;
      }

      return token;
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.profileComplete = token.profileComplete as boolean;
        session.user.role = token.role as Role;
        session.user.isPremium = token.isPremium as boolean;

        const now = Date.now();
        const globalAny = global as any;
        if (
          !globalAny.lastSessionLog ||
          now - globalAny.lastSessionLog > 5000
        ) {
          globalAny.lastSessionLog = now;
        }
      }
      return session;
    },
  },
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  ...authConfig,
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
