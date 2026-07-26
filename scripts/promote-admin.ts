import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function promoteAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Error: Please provide the email of the account to promote.');
    console.log('Usage: npx tsx scripts/promote-admin.ts <email>');
    process.exit(1);
  }

  try {
    console.log(`Promoting ${email} to Admin...`);
    
    // BetterAuth uses the "user" table
    const result = await db.execute(
      sql`UPDATE "user" SET role = 'Admin' WHERE email = ${email}`
    );

    if (result.rowCount === 0) {
      console.error(`❌ Error: User with email ${email} not found.`);
      console.log('Please register the account through the UI first.');
      process.exit(1);
    }

    console.log(`✅ Success! ${email} is now an Admin.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Database error:', error);
    process.exit(1);
  }
}

promoteAdmin();
