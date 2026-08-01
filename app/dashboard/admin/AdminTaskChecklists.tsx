'use client';

import { useCallback } from 'react';
import { TaskChecklist } from '@/components/dashboard/TaskChecklist';
import type { TaskChecklistData } from '@/components/dashboard/TaskChecklist';
import { useRouter } from 'next/navigation';

interface AdminTaskChecklistsProps {
  checklists: TaskChecklistData[];
}

export function AdminTaskChecklists({ checklists }: AdminTaskChecklistsProps) {
  const router = useRouter();

  const handleTaskToggle = useCallback(
    async (taskId: string, completed: boolean) => {
      try {
        await fetch('/api/admin/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId, completed }),
        });
        router.refresh();
      } catch (err) {
        console.error('Failed to toggle task:', err);
      }
    },
    [router]
  );

  const handleTaskDelete = useCallback(
    async (taskId: string) => {
      try {
        await fetch(`/api/admin/tasks?taskId=${taskId}`, {
          method: 'DELETE',
        });
        router.refresh();
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    },
    [router]
  );

  return (
    <div className="space-y-4">
      {checklists.map((checklist) => (
        <TaskChecklist
          key={checklist.id}
          checklist={checklist}
          isAdmin={true}
          onTaskToggle={handleTaskToggle}
          onTaskDelete={handleTaskDelete}
        />
      ))}
    </div>
  );
}
