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
      if (account?.provider === "google") {
        if (user.email) {
          try {
            const existingUser = await prisma.user.findUnique({
              where: { email: user.email },
              select: { hasSeenWelcomeMessage: true },
            });

            if (existingUser && !existingUser.hasSeenWelcomeMessage) {
              await prisma.user.update({
                where: { email: user.email },
                data: { hasSeenWelcomeMessage: true },
              });

              try {
                await sendWelcomeEmail(user.email, user.name || "חבר חדש");
              } catch (emailError) {
                console.error("Failed to send welcome email:", emailError);
              }
            }
          } catch (error) {
            console.error("Error in Google signIn callback:", error);
          }
        }
      }
      return true;
    },
    async jwt({ user, token }) {
      if (user) {
        token.profileComplete = user.profileComplete;
        token.role = user.role;
      }

      return token;
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.profileComplete = token.profileComplete as boolean;
        session.user.role = token.role as Role;

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
