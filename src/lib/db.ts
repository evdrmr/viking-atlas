import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { parse } from 'pg-connection-string';

const connectionString = process.env.DATABASE_URL!;
const config = parse(connectionString);

// Delete connectionString to force pg to use the parsed config object properties
delete (config as any).connectionString;

// Programmatically force SSL settings on the pool
config.ssl = { rejectUnauthorized: false };

const pool = new pg.Pool(config);
const adapter = new PrismaPg(pool, { schema: 'viking_atlas' });

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
