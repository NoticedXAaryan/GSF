import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { applications, masterclassData } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/api-helpers';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function MasterclassAdminPage() {
  const session = await getSession(await headers());
  if (!session) redirect('/login');
  if (session.user.role !== 'Admin' && session.user.role !== 'Lead') {
    redirect('/dashboard/user');
  }

  const classes = await db
    .select({
      id: applications.id,
      userName: applications.userName,
      userEmail: applications.userEmail,
      status: applications.status,
      sessions: masterclassData.sessions,
    })
    .from(applications)
    .innerJoin(masterclassData, eq(applications.id, masterclassData.applicationId));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Masterclass Registrations" description="Review all Masterclass registrations." />

      <div className="overflow-hidden rounded-bento border border-line bg-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-fg">
            <thead className="bg-panel-alt text-xs font-semibold uppercase text-fg-dim">
              <tr>
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">Selected Sessions</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {classes.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-fg-dim">
                    No registrations found.
                  </td>
                </tr>
              ) : (
                classes.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-panel-alt">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{p.userName}</div>
                      <div className="text-xs text-fg-dim">{p.userEmail}</div>
                    </td>
                    <td className="px-4 py-3">
                      {Array.isArray(p.sessions) ? (
                        <ul className="list-disc pl-5">
                          {p.sessions.map((s: string) => <li key={s}>{s}</li>)}
                        </ul>
                      ) : 'None'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.status === 'accepted' ? 'bg-lime/10 text-lime' : 
                        p.status === 'rejected' ? 'bg-magenta/10 text-magenta' : 
                        'bg-amber-500/10 text-amber-500'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
