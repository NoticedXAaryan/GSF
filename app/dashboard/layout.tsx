import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { DashboardShell } from './DashboardShell';

/**
 * Dashboard layout — server-side auth guard for all /dashboard/* routes.
 * Fetches session server-side, redirects to /login if unauthenticated.
 * Provides role-based navigation shell.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const role = (session.user as { role?: string })?.role || 'Attendee';

  return (
    <DashboardShell role={role} userName={session.user.name || 'User'}>
      {children}
    </DashboardShell>
  );
}
