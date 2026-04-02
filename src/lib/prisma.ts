import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ??
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - type resolves after: npx prisma generate
  new PrismaClient({
    // datasourceUrl: process.env.DATABASE_URL!,
    log: process.env.NODE_ENV === "development" ? (["query","error","warn"] as const) : ["error"],
  });

if (process.env.NODE_ENV !== "production"){
  globalForPrisma.prisma = prisma;
}