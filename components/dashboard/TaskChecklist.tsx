"use client";

import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import type { Task } from "@/lib/types";

interface TaskChecklistData {
  id: string;
  title: string;
  subEventId: string;
  tasks: Task[];
}

interface TaskChecklistProps {
  checklist: TaskChecklistData;
  isAdmin: boolean;
  onTaskToggle: (taskId: string, completed: boolean) => void;
  onTaskAdd?: () => void;
  onTaskEdit?: (taskId: string) => void;
  onTaskDelete?: (taskId: string) => void;
}

function getProgressPercentage(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.completed).length;
  return Math.round((completed / tasks.length) * 100);
}

function getProgressColor(percentage: number): string {
  if (percentage > 75) return "bg-green-500";
  if (percentage >= 25) return "bg-yellow-500";
  return "bg-red-500";
}

function isOverdue(task: Task): boolean {
  if (task.completed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

function formatDueDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function TaskChecklist({
  checklist,
  isAdmin,
  onTaskToggle,
  onTaskAdd,
  onTaskEdit,
  onTaskDelete,
}: TaskChecklistProps) {
  const progress = getProgressPercentage(checklist.tasks);
  const completedCount = checklist.tasks.filter((t) => t.completed).length;
  const totalCount = checklist.tasks.length;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{checklist.title}</h3>
          {isAdmin && onTaskAdd && (
            <button
              type="button"
              onClick={onTaskAdd}
              className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors min-h-[44px] min-w-[44px] justify-center"
              aria-label="Add task"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {completedCount} / {totalCount} tasks complete
            </span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Task progress: ${progress}%`}
            />
          </div>
        </div>
      </CardHeader>

      <CardBody className="p-0">
        {totalCount === 0 ? (
          <p className="px-6 py-4 text-center text-sm text-gray-500">
            No tasks in this checklist yet.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {checklist.tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-start gap-3 px-6 py-3 hover:bg-gray-50 transition-colors"
              >
                {/* Checkbox */}
                <label className="flex items-center min-h-[44px] min-w-[44px] justify-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => onTaskToggle(task.id, !task.completed)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    aria-label={`Mark "${task.title}" as ${task.completed ? "incomplete" : "complete"}`}
                  />
                </label>

                {/* Task content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-medium ${
                        task.completed ? "text-gray-400 line-through" : "text-gray-900"
                      }`}
                    >
                      {task.title}
                    </span>
                    {isOverdue(task) && (
                      <Badge className="bg-red-100 text-red-800">Overdue</Badge>
                    )}
                  </div>
                  {task.description && (
                    <p
                      className={`mt-0.5 text-xs ${
                        task.completed ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      {task.description}
                    </p>
                  )}
                  <span
                    className={`mt-1 inline-block text-xs ${
                      task.completed ? "text-gray-300" : "text-gray-400"
                    }`}
                  >
                    Due: {formatDueDate(task.dueDate)}
                  </span>
                </div>

                {/* Admin actions */}
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    {onTaskEdit && (
                      <button
                        type="button"
                        onClick={() => onTaskEdit(task.id)}
                        className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        aria-label={`Edit task "${task.title}"`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                    )}
                    {onTaskDelete && (
                      <button
                        type="button"
                        onClick={() => onTaskDelete(task.id)}
                        className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        aria-label={`Delete task "${task.title}"`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

export type { TaskChecklistData, TaskChecklistProps };
