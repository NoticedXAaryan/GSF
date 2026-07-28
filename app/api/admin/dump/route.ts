import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user, account } from '@/lib/schema';

export async function GET() {
  try {
    const users = await db.select().from(user);
    const accounts = await db.select().from(account);
    return NextResponse.json({ users, accounts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
