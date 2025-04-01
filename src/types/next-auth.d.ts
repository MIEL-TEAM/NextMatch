import { Role } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    profileComplete: boolean;
    role: Role;
  }

  interface Session {
    user: {
      profileComplete: boolean;
      role: Role;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface Jwt {
    profileComplete: boolean;
    role: Role;
  }
}

// Create a file like types/env.d.ts
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
