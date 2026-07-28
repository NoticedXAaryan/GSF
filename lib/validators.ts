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
  collegeDept: z.string().max(100).optional().default(''),
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
