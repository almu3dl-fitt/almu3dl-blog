import "server-only";

import path from "node:path";

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function resolveDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl?.startsWith("file:")) {
    return databaseUrl;
  }

  const sqlitePath = databaseUrl.slice("file:".length);
  if (!sqlitePath.startsWith("./") && !sqlitePath.startsWith("../")) {
    return databaseUrl;
  }

  return `file:${path.resolve(/* turbopackIgnore: true */ process.cwd(), sqlitePath)}`;
}

const databaseUrl = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(
    databaseUrl
      ? {
          datasources: {
            db: {
              url: databaseUrl,
            },
          },
        }
      : undefined,
  );

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
