/**
 * Zod validation schemas for all API inputs.
 * Every API route validates its input against these before touching the database.
 */
import { z } from 'zod';

// ── Phone validation ──
const phoneRegex = /^\+?[1-9]\d{7,14}$/;

// ────────────────────────────────────────────────────────────
// Auth / Profile
// ────────────────────────────────────────────────────────────

export const completeProfileSchema = z.object({
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(phoneRegex, 'Invalid phone number format'),
  college: z.string().min(1, 'College is required').max(150),
  course: z.string().min(1, 'Course is required').max(150),
  semester: z.string().min(1, 'Semester is required').max(50),
});

// ────────────────────────────────────────────────────────────
// Events
// ────────────────────────────────────────────────────────────

export const createEventSchema = z.object({
  name: z.string().min(1, 'Event name is required').max(200),
  description: z.string().max(2000).optional().default(''),
  date: z.string().min(1, 'Date is required'), // ISO date string
  day: z.number().int().min(1).max(5).optional().default(1),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  venue: z.string().min(1, 'Venue is required').max(200),
  type: z.enum(['open', 'registration', 'restricted', 'shortlisted']),
  targetAudience: z.string().max(200).optional().default('all'),
  capacity: z.number().int().positive().nullable().optional().default(null),
  requiresShortlisting: z.boolean().optional().default(false),
  coordinatorName: z.string().max(200).optional().default(''),
  status: z.enum(['draft', 'published', 'archived']).optional().default('draft'),
});

export const updateEventSchema = createEventSchema.partial().omit({
  // These fields cannot be changed via update
});

// ────────────────────────────────────────────────────────────
// Applications
// ────────────────────────────────────────────────────────────

export const updateApplicationSchema = z.object({
  applicationId: z.string().uuid('Invalid application ID'),
  status: z.enum(['pending', 'accepted', 'waitlisted', 'rejected', 'not_eligible']),
  notes: z.string().max(1000).optional().default(''),
});

// ────────────────────────────────────────────────────────────
// Scan
// ────────────────────────────────────────────────────────────

export const scanSchema = z
  .object({
    eventId: z.string().min(1, 'Event ID is required'),
    passId: z.string().optional(),
    qrToken: z.string().optional(),
  })
  .refine((data) => data.passId || data.qrToken, {
    message: 'Either passId or qrToken is required',
  });

// ────────────────────────────────────────────────────────────
// Announcements
// ────────────────────────────────────────────────────────────

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  body: z.string().min(1, 'Body is required').max(5000),
  audience: z.string().max(200).optional().default('all'),
  priority: z.enum(['low', 'normal', 'high']).optional().default('normal'),
});

// ────────────────────────────────────────────────────────────
// Admin
// ────────────────────────────────────────────────────────────

export const updateRoleSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: z.enum(['Attendee', 'Volunteer', 'Faculty', 'Admin', 'Lead']),
});

// ────────────────────────────────────────────────────────────
// Task Checklists & Tasks
// ────────────────────────────────────────────────────────────

export const createTaskChecklistSchema = z.object({
  subEventId: z.string().min(1, 'Sub-event ID is required'),
  leadUid: z.string().min(1, 'Lead user ID is required'),
  title: z.string().min(1, 'Title is required').max(200),
});

export const createTaskSchema = z.object({
  checklistId: z.string().min(1, 'Checklist ID is required'),
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional().default(''),
  dueDate: z.string().min(1, 'Due date is required').regex(/^\d{4}-\d{2}-\d{2}/, 'Due date must be in ISO format'),
  sortOrder: z.number().optional().default(0),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  dueDate: z.string().min(1).regex(/^\d{4}-\d{2}-\d{2}/, 'Due date must be in ISO format').optional(),
  completed: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

// ────────────────────────────────────────────────────────────
// Volunteer Assignment
// ────────────────────────────────────────────────────────────

export const assignVolunteerSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  subEventId: z.string().min(1, 'Sub-event ID is required'),
});
