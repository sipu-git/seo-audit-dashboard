import { PrismaClient } from "@prisma/client";

type PrismaGlobal = typeof globalThis & {
  prismaClient?: PrismaClient;
};

const globalForPrisma = globalThis as PrismaGlobal;

export const prisma =
  globalForPrisma.prismaClient ??
  new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaClient = prisma;
}
