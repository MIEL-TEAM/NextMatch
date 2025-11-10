import { Role } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    profileComplete: boolean;
    role: Role;
    isPremium: boolean;
  }

  interface Session {
    user: {
      profileComplete: boolean;
      role: Role;
      isPremium: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface Jwt {
    profileComplete: boolean;
    role: Role;
    isPremium: boolean;
  }
}

declare module "process" {
  namespace NodeJS {
    interface ProcessEnv {
      STRIPE_SECRET_KEY: string;
      STRIPE_WEBHOOK_SECRET: string;
      [key: string]: string | undefined;
    }
  }
}

export {};
