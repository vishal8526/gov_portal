/**
 * ============================================================================
 * Prisma Client Singleton — Prisma v7 compatible
 * ============================================================================
 * Prevents multiple Prisma Client instances during hot-reload in development.
 * Uses the global object to persist the client across module reloads.
 * 
 * Prisma v7 changes:
 * - PrismaClient now requires an adapter or accelerateUrl
 * - Postgres deployment uses @prisma/adapter-pg for Vercel compatibility
 * ============================================================================
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined;
  pool: Pool | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required. Set it in Vercel and local .env.');
}

const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString,
    max: 5,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : undefined,
  });

/**
 * Singleton Prisma Client instance.
 * In development, the instance is cached on the global object to prevent
 * exhausting database connections during Next.js hot module replacement.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(pool),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}

export default prisma;
