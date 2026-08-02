import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { resolveDashboardPath } from '@/lib/landing/auth-routing';

/**
 * Dashboard router — Server Component that redirects authenticated users
 * to their role-appropriate dashboard sub-page.
 * Uses the canonical resolveDashboardPath resolver for consistent role routing.
 * This page never renders any UI.
 */
export default async function DashboardRootPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const role = (session.user as { role?: string })?.role ?? null;

  redirect(resolveDashboardPath(role));
}
