import { PrismaClient } from "@prisma/client";

// The code global as unknown as { prisma: PrismaClient } is TypeScript syntax that casts the global object to a type that expects a prisma property of type PrismaClient. This allows you to safely access the prisma object globally.

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
