import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { jsonResponse, errorResponse } from '@/lib/api-helpers';

/**
 * GET /api/admin/debug-schema
 * Temporary diagnostic endpoint — shows user table columns.
 * Remove after verifying schema.
 */
export async function GET() {
  try {
    const cols = await db.execute(
      sql`SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'user' ORDER BY ordinal_position`
    );

    const tables = await db.execute(
      sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
    );

    return jsonResponse({
      userColumns: cols.rows,
      allTables: tables.rows,
    });
  } catch (error) {
    console.error('[debug-schema]', error);
    return errorResponse('Database error', 500);
  }
}
