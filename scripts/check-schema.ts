import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function checkSchema() {
  try {
    // Check user table columns
    const cols = await db.execute(
      sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user' ORDER BY ordinal_position`
    );
    console.log('=== USER TABLE COLUMNS ===');
    console.log(JSON.stringify(cols.rows, null, 2));

    // Check all tables
    const tables = await db.execute(
      sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
    );
    console.log('\n=== ALL TABLES ===');
    console.log(JSON.stringify(tables.rows, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('DB Error:', err);
    process.exit(1);
  }
}

checkSchema();
