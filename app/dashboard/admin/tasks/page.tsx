import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { taskChecklists, tasks, events } from '@/lib/schema';
import { resolveDashboardPath } from '@/lib/landing/auth-routing';
import { AdminTaskChecklists } from '../AdminTaskChecklists';
import { TaskManager } from './TaskManager';
import { PageHeader } from '@/components/dashboard/PageHeader';

export default async function AdminTasksPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const role = (session.user as { role?: string })?.role || 'Attendee';
  if (role !== 'Admin' && role !== 'Lead') {
    redirect(resolveDashboardPath(role));
  }

  // Fetch all checklists, tasks, and events for dropdown
  const [checklistsResult, tasksResult, eventsResult] = await Promise.all([
    db.select().from(taskChecklists),
    db.select().from(tasks),
    db.select({ id: events.id, name: events.name }).from(events),
  ]);

  // Compose checklists with their tasks
  const checklistsWithTasks = checklistsResult.map((checklist) => ({
    id: checklist.id,
    title: checklist.title,
    subEventId: checklist.subEventId,
    tasks: tasksResult
      .filter((t) => t.checklistId === checklist.id)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((t) => ({
        id: t.id,
        checklistId: t.checklistId,
        title: t.title,
        description: t.description ?? '',
        dueDate: t.dueDate,
        completed: t.completed ?? false,
        completedAt: t.completedAt,
        sortOrder: t.sortOrder ?? 0,
      })),
  }));

  const eventOptions = eventsResult.map((e) => ({ id: e.id, name: e.name }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ops board"
        title="Task Management"
        description="Create checklists, add tasks, and track progress across sub-events."
      />

      {/* Create new checklist / task */}
      <TaskManager
        events={eventOptions}
        checklists={checklistsResult.map((c) => ({ id: c.id, title: c.title }))}
        userId={session.user.id}
      />

      {/* Existing checklists */}
      {checklistsWithTasks.length > 0 ? (
        <section>
          <h2 className="text-lg font-semibold text-fg mb-4">Checklists</h2>
          <AdminTaskChecklists checklists={checklistsWithTasks} />
        </section>
      ) : (
        <div className="rounded-bento border border-line bg-panel-alt p-8 text-center">
          <p className="text-fg-dim">No checklists created yet. Create one above.</p>
        </div>
      )}
    </div>
  );
}
