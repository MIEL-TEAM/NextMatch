import { Role } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    profileComplete: boolean;
    role: Role;
    isPremium: boolean;
    gender?: string | null;
  }

  interface Session {
    user: {
      profileComplete: boolean;
      role: Role;
      isPremium: boolean;
      gender?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    profileComplete: boolean;
    role: Role;
    isPremium: boolean;
    gender?: string | null;
  }
}

declare module "process" {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
    }
  }
}

export {};
