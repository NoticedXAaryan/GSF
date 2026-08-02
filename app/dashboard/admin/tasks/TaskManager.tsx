'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface TaskManagerProps {
  events: { id: string; name: string }[];
  checklists: { id: string; title: string }[];
  userId: string;
}

export function TaskManager({ events, checklists, userId }: TaskManagerProps) {
  const router = useRouter();

  // Checklist form state
  const [showChecklistForm, setShowChecklistForm] = useState(false);
  const [clTitle, setClTitle] = useState('');
  const [clEventId, setClEventId] = useState('');
  const [clSubmitting, setClSubmitting] = useState(false);
  const [clError, setClError] = useState<string | null>(null);

  // Task form state
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskChecklistId, setTaskChecklistId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);

  async function handleCreateChecklist(e: React.FormEvent) {
    e.preventDefault();
    setClSubmitting(true);
    setClError(null);

    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subEventId: clEventId,
          leadUid: userId,
          title: clTitle.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setClError(data.error || 'Failed to create checklist');
        return;
      }

      setClTitle('');
      setClEventId('');
      setShowChecklistForm(false);
      router.refresh();
    } catch {
      setClError('Network error');
    } finally {
      setClSubmitting(false);
    }
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    setTaskSubmitting(true);
    setTaskError(null);

    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklistId: taskChecklistId,
          title: taskTitle.trim(),
          description: taskDescription.trim(),
          dueDate: taskDueDate,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setTaskError(data.error || 'Failed to create task');
        return;
      }

      setTaskTitle('');
      setTaskDescription('');
      setTaskDueDate('');
      setTaskChecklistId('');
      setShowTaskForm(false);
      router.refresh();
    } catch {
      setTaskError('Network error');
    } finally {
      setTaskSubmitting(false);
    }
  }

  const eventOptions = events.map((e) => ({ value: e.id, label: e.name }));
  const checklistOptions = checklists.map((c) => ({ value: c.id, label: c.title }));

  return (
    <div className="flex gap-3 flex-wrap">
      {/* Create Checklist Button / Form */}
      {!showChecklistForm ? (
        <Button size="sm" variant="secondary" onClick={() => setShowChecklistForm(true)}>
          + New Checklist
        </Button>
      ) : (
        <Card className="w-full">
          <CardHeader>
            <h3 className="text-sm font-medium text-fg">New Checklist</h3>
          </CardHeader>
          <CardBody>
            {clError && (
              <p className="mb-2 text-sm font-semibold text-magenta" role="alert">{clError}</p>
            )}
            <form onSubmit={handleCreateChecklist} className="space-y-3" noValidate>
              <Input
                label="Title *"
                value={clTitle}
                onChange={(e) => setClTitle(e.target.value)}
                placeholder="Checklist title"
                maxLength={200}
              />
              <Select
                label="Sub-Event *"
                options={[{ value: '', label: 'Select a sub-event…' }, ...eventOptions]}
                value={clEventId}
                onChange={(e) => setClEventId(e.target.value)}
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" loading={clSubmitting}>
                  Create Checklist
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowChecklistForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Create Task Button / Form */}
      {checklists.length > 0 && !showTaskForm ? (
        <Button size="sm" variant="secondary" onClick={() => setShowTaskForm(true)}>
          + New Task
        </Button>
      ) : showTaskForm ? (
        <Card className="w-full">
          <CardHeader>
            <h3 className="text-sm font-medium text-fg">New Task</h3>
          </CardHeader>
          <CardBody>
            {taskError && (
              <p className="mb-2 text-sm font-semibold text-magenta" role="alert">{taskError}</p>
            )}
            <form onSubmit={handleCreateTask} className="space-y-3" noValidate>
              <Select
                label="Checklist *"
                options={[{ value: '', label: 'Select a checklist…' }, ...checklistOptions]}
                value={taskChecklistId}
                onChange={(e) => setTaskChecklistId(e.target.value)}
              />
              <Input
                label="Title *"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Task title"
                maxLength={100}
              />
              <Input
                label="Description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Optional description"
                maxLength={500}
              />
              <Input
                label="Due Date *"
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" loading={taskSubmitting}>
                  Create Task
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowTaskForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
