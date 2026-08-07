import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { applications, reelPitchData } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/api-helpers';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function ReelPitchAdminPage() {
  const session = await getSession(await headers());
  if (!session) redirect('/login');
  if (session.user.role !== 'Admin' && session.user.role !== 'Lead') {
    redirect('/dashboard/user');
  }

  const pitches = await db
    .select({
      id: applications.id,
      userName: applications.userName,
      userEmail: applications.userEmail,
      status: applications.status,
      instagramUrl: reelPitchData.instagramUrl,
      teamMembers: reelPitchData.teamMembers,
    })
    .from(applications)
    .innerJoin(reelPitchData, eq(applications.id, reelPitchData.applicationId));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Reel Pitch Applications" description="Review all Reel Pitch submissions." />

      <div className="overflow-hidden rounded-bento border border-line bg-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-fg">
            <thead className="bg-panel-alt text-xs font-semibold uppercase text-fg-dim">
              <tr>
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">Instagram URL</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Members</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {pitches.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-fg-dim">
                    No reel pitches found.
                  </td>
                </tr>
              ) : (
                pitches.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-panel-alt">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{p.userName}</div>
                      <div className="text-xs text-fg-dim">{p.userEmail}</div>
                    </td>
                    <td className="px-4 py-3">
                      <a href={p.instagramUrl} target="_blank" rel="noreferrer" className="text-lime hover:underline">
                        View Reel
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.status === 'accepted' ? 'bg-lime/10 text-lime' : 
                        p.status === 'rejected' ? 'bg-magenta/10 text-magenta' : 
                        'bg-amber-500/10 text-amber-500'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {Array.isArray(p.teamMembers) ? p.teamMembers.length : 0}
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
