import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { user, clearancePasses } from '@/lib/schema';
import { PassCardInteractive } from './PassCardInteractive';

/**
 * Attendee Pass Page — Server Component
 * Shows the scannable pass card in a clean, focused view.
 */
export default async function UserPassPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const userId = session.user.id;

  const [userProfile] = await db
    .select({
      id: user.id,
      name: user.name,
      role: user.role,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!userProfile) {
    redirect('/login');
  }

  const [pass] = await db
    .select({
      passId: clearancePasses.passId,
      qrToken: clearancePasses.qrToken,
      issuedAt: clearancePasses.issuedAt,
    })
    .from(clearancePasses)
    .where(eq(clearancePasses.uid, userId))
    .limit(1);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="px-1 pt-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-dim">
          Entry credential
        </p>
        <h1 className="mt-1 text-4xl font-bold leading-none tracking-tighter lg:text-5xl">
          My Pass
        </h1>
      </div>

      <div className="mt-6 flex justify-center lg:mt-10">
        <PassCardInteractive
          pass={pass ?? null}
          userName={userProfile.name}
          userRole={userProfile.role}
        />
      </div>
    </div>
  );
}
