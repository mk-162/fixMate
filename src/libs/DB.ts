import path from 'node:path';

import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePg, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate as migratePg } from 'drizzle-orm/node-postgres/migrator';
import { drizzle as drizzlePglite, type PgliteDatabase } from 'drizzle-orm/pglite';
import { migrate as migratePglite } from 'drizzle-orm/pglite/migrator';
import { PHASE_PRODUCTION_BUILD } from 'next/dist/shared/lib/constants';
import { Client } from 'pg';

import * as schema from '@/models/Schema';

import { Env } from './Env';

type DrizzleDB = NodePgDatabase<typeof schema> | PgliteDatabase<typeof schema>;

// Global singleton for database connection
const globalForDb = globalThis as unknown as {
  dbPromise: Promise<DrizzleDB> | undefined;
  db: DrizzleDB | undefined;
};

async function initializeDatabase(): Promise<DrizzleDB> {
  if (process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD && Env.DATABASE_URL) {
    const client = new Client({
      connectionString: Env.DATABASE_URL,
    });
    await client.connect();

    const drizzle = drizzlePg(client, { schema });

    // Run migrations - catch errors for already-applied migrations
    try {
      await migratePg(drizzle, {
        migrationsFolder: path.join(process.cwd(), 'migrations'),
      });
    } catch (error) {
      // Log but don't fail if migrations have issues (likely already applied)
      console.warn('Migration warning:', error instanceof Error ? error.message : error);
    }

    return drizzle;
  } else {
    // Use PGlite for local development without DATABASE_URL
    const global = globalThis as unknown as { client: PGlite; drizzle: PgliteDatabase<typeof schema> };

    if (!global.client) {
      global.client = new PGlite();
      await global.client.waitReady;

      global.drizzle = drizzlePglite(global.client, { schema });
    }

    await migratePglite(global.drizzle, {
      migrationsFolder: path.join(process.cwd(), 'migrations'),
    });
    return global.drizzle;
  }
}

// Lazy initialization - call this in server actions/API routes
export async function getDb(): Promise<DrizzleDB> {
  if (globalForDb.db) {
    return globalForDb.db;
  }

  if (!globalForDb.dbPromise) {
    globalForDb.dbPromise = initializeDatabase().then((instance) => {
      globalForDb.db = instance;
      return instance;
    });
  }

  return globalForDb.dbPromise;
}

// Deprecated: Use getDb() instead
// This is only kept for backwards compatibility and will throw an error
export const db = null as unknown as DrizzleDB;
