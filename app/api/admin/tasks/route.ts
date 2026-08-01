import { NextRequest } from 'next/server';
import { eq, and, count } from 'drizzle-orm';
import { db } from '@/lib/db';
import { taskChecklists, tasks } from '@/lib/schema';
import {
  createTaskChecklistSchema,
  createTaskSchema,
  updateTaskSchema,
} from '@/lib/validators';
import {
  jsonResponse,
  errorResponse,
  requireAdmin,
  requireLead,
  generateId,
} from '@/lib/api-helpers';

// ────────────────────────────────────────────────────────────
// POST /api/admin/tasks — Create a checklist or a task (Admin only)
// ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin(request.headers);
    if (!session) {
      return errorResponse('Unauthorized. Admin access required.', 403);
    }

    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return errorResponse('Invalid request body', 400);
    }

    // Determine if this is a task (has checklistId) or a checklist
    const isTask = typeof raw === 'object' && raw !== null && 'checklistId' in raw;

    if (isTask) {
      // Validate as a task
      const result = createTaskSchema.safeParse(raw);
      if (!result.success) {
        const messages = result.error.issues.map(
          (issue) => `${issue.path.join('.')}: ${issue.message}`
        );
        return errorResponse('Validation failed', 422, messages);
      }

      const data = result.data;
      const now = Date.now();

      const [task] = await db
        .insert(tasks)
        .values({
          id: generateId(),
          checklistId: data.checklistId,
          title: data.title,
          description: data.description,
          dueDate: data.dueDate,
          sortOrder: data.sortOrder,
          completed: false,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      return jsonResponse({ task }, 201);
    } else {
      // Validate as a checklist
      const result = createTaskChecklistSchema.safeParse(raw);
      if (!result.success) {
        const messages = result.error.issues.map(
          (issue) => `${issue.path.join('.')}: ${issue.message}`
        );
        return errorResponse('Validation failed', 422, messages);
      }

      const data = result.data;
      const now = Date.now();

      const [checklist] = await db
        .insert(taskChecklists)
        .values({
          id: generateId(),
          subEventId: data.subEventId,
          leadUid: data.leadUid,
          title: data.title,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      return jsonResponse({ checklist }, 201);
    }
  } catch (error) {
    console.error('[POST /api/admin/tasks]', error);
    return errorResponse('Internal server error', 500);
  }
}

// ────────────────────────────────────────────────────────────
// PUT /api/admin/tasks — Update a task (Admin or Lead)
// ────────────────────────────────────────────────────────────

export async function PUT(request: NextRequest) {
  try {
    const session = await requireLead(request.headers);
    if (!session) {
      return errorResponse('Unauthorized. Admin or Lead access required.', 403);
    }

    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return errorResponse('Invalid request body', 400);
    }

    if (typeof raw !== 'object' || raw === null || !('taskId' in raw)) {
      return errorResponse('taskId is required', 400);
    }

    const taskId = (raw as Record<string, unknown>).taskId;
    if (typeof taskId !== 'string' || !taskId) {
      return errorResponse('taskId must be a non-empty string', 400);
    }

    // Validate the update fields
    const result = updateTaskSchema.safeParse(raw);
    if (!result.success) {
      const messages = result.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`
      );
      return errorResponse('Validation failed', 422, messages);
    }

    const data = result.data;
    const now = Date.now();

    // Build update object
    const updateFields: Record<string, unknown> = { updatedAt: now };

    if (data.title !== undefined) updateFields.title = data.title;
    if (data.description !== undefined) updateFields.description = data.description;
    if (data.dueDate !== undefined) updateFields.dueDate = data.dueDate;
    if (data.sortOrder !== undefined) updateFields.sortOrder = data.sortOrder;

    if (data.completed !== undefined) {
      updateFields.completed = data.completed;
      updateFields.completedAt = data.completed ? now : null;
    }

    const [updatedTask] = await db
      .update(tasks)
      .set(updateFields)
      .where(eq(tasks.id, taskId))
      .returning();

    if (!updatedTask) {
      return errorResponse('Task not found', 404);
    }

    // Recalculate progress for the checklist
    const checklistId = updatedTask.checklistId;

    const [totalResult] = await db
      .select({ value: count() })
      .from(tasks)
      .where(eq(tasks.checklistId, checklistId));

    const [completedResult] = await db
      .select({ value: count() })
      .from(tasks)
      .where(and(eq(tasks.checklistId, checklistId), eq(tasks.completed, true)));

    const total = totalResult?.value ?? 0;
    const completed = completedResult?.value ?? 0;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return jsonResponse({ task: updatedTask, progress });
  } catch (error) {
    console.error('[PUT /api/admin/tasks]', error);
    return errorResponse('Internal server error', 500);
  }
}

// ────────────────────────────────────────────────────────────
// DELETE /api/admin/tasks — Remove a task (Admin only)
// ────────────────────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAdmin(request.headers);
    if (!session) {
      return errorResponse('Unauthorized. Admin access required.', 403);
    }

    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return errorResponse('Invalid request body', 400);
    }

    if (typeof raw !== 'object' || raw === null || !('taskId' in raw)) {
      return errorResponse('taskId is required', 400);
    }

    const taskId = (raw as Record<string, unknown>).taskId;
    if (typeof taskId !== 'string' || !taskId) {
      return errorResponse('taskId must be a non-empty string', 400);
    }

    // Get the task first to know which checklist it belongs to
    const [existingTask] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId));

    if (!existingTask) {
      return errorResponse('Task not found', 404);
    }

    const checklistId = existingTask.checklistId;

    // Delete the task
    await db.delete(tasks).where(eq(tasks.id, taskId));

    // Recalculate progress for the checklist
    const [totalResult] = await db
      .select({ value: count() })
      .from(tasks)
      .where(eq(tasks.checklistId, checklistId));

    const [completedResult] = await db
      .select({ value: count() })
      .from(tasks)
      .where(and(eq(tasks.checklistId, checklistId), eq(tasks.completed, true)));

    const total = totalResult?.value ?? 0;
    const completed = completedResult?.value ?? 0;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return jsonResponse({ message: 'Task deleted', progress });
  } catch (error) {
    console.error('[DELETE /api/admin/tasks]', error);
    return errorResponse('Internal server error', 500);
  }
}
