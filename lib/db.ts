import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// ── Singleton pool — survives Next.js hot reloads in dev ──
const globalForDb = globalThis as unknown as { pgPool: Pool | undefined };

const pool =
  globalForDb.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // Production-grade pool configuration
    max: 20,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 15_000, // Increased to 15s to allow Neon DB to wake up from cold start
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pgPool = pool;
}

/**
 * The Drizzle ORM instance with full schema awareness.
 * Use this for all database operations — it provides:
 * - Type-safe queries with auto-completion
 * - Parameterized queries (SQL injection protection)
 * - Relation loading
 * - Transaction support
 */
export const db = drizzle(pool, { schema });

export { pool };
