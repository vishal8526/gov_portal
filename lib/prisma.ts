/**
 * ============================================================================
 * Prisma Client Singleton — Prisma v7 compatible
 * ============================================================================
 * Prevents multiple Prisma Client instances during hot-reload in development.
 * Uses the global object to persist the client across module reloads.
 * 
 * Prisma v7 changes:
 * - PrismaClient now requires an adapter or accelerateUrl
 * - For SQLite, we use @prisma/adapter-libsql or direct file connection
 * ============================================================================
 */

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined;
};

/**
 * Singleton Prisma Client instance.
 * In development, the instance is cached on the global object to prevent
 * exhausting database connections during Next.js hot module replacement.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL ?? 'file:./dev.db',
    }),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
