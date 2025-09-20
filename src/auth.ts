import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import authConfig from "./auth.config";
import { prisma } from "./lib/prisma";
import { Role } from "@prisma/client";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  callbacks: {
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
