import { PrismaClient } from '@prisma/client';

/**
 * Prisma singleton.
 *
 * Serverless functions are frozen and thawed rather than torn down, so the module
 * scope survives between invocations on a warm instance. Caching the client on
 * globalThis stops each invocation from opening a new pool — which is what
 * exhausts Postgres connections under load. DATABASE_URL must point at Neon's
 * pooled (pgbouncer) endpoint for the same reason.
 */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
