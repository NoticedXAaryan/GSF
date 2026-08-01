import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

/**
 * Dashboard router — Server Component that redirects authenticated users
 * to their role-appropriate dashboard sub-page.
 * This page never renders any UI.
 */
export default async function DashboardRootPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const role = session.user?.role || 'Attendee';

  if (role === 'Admin' || role === 'Lead') {
    redirect('/dashboard/admin');
  } else if (role === 'Volunteer') {
    redirect('/dashboard/volunteer');
  } else {
    redirect('/dashboard/user');
  }
}
