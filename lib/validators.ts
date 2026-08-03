/**
 * Zod validation schemas for all API inputs.
 * Every API route validates its input against these before touching the database.
 */
import { z } from 'zod';
import {
  VALID_COLLEGES,
  VALID_COURSES,
  VALID_SEMESTERS,
  COURSE_TO_COLLEGE,
} from '@/lib/constants/colleges';

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
  college: z
    .string()
    .min(1, 'College is required')
    .max(150)
    .refine((v) => VALID_COLLEGES.has(v), 'Invalid college selection'),
  course: z
    .string()
    .min(1, 'Course is required')
    .max(150)
    .refine((v) => VALID_COURSES.has(v), 'Invalid course selection'),
  semester: z
    .string()
    .min(1, 'Semester is required')
    .max(50)
    .refine((v) => VALID_SEMESTERS.has(v), 'Invalid semester selection'),
  enrollmentNumber: z
    .string()
    .min(1, 'Enrollment number is required')
    .max(30)
    .regex(/^GA/i, 'Enrollment number must start with GA'),
  universityId: z
    .string()
    .min(1, 'University ID is required')
    .max(20)
    .regex(/^\d+$/, 'University ID must contain numbers only'),
}).refine(
  (data) => {
    // Cross-validate: the course must belong to the selected college
    const expectedCollege = COURSE_TO_COLLEGE[data.course];
    return !expectedCollege || expectedCollege === data.college;
  },
  { message: 'Selected course does not belong to the selected college', path: ['course'] }
);

export const updateProfileSchema = z.object({
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(phoneRegex, 'Invalid phone number format')
    .optional(),
  college: z
    .string()
    .min(1, 'College is required')
    .max(150)
    .refine((v) => VALID_COLLEGES.has(v), 'Invalid college selection')
    .optional(),
  course: z
    .string()
    .min(1, 'Course is required')
    .max(150)
    .refine((v) => VALID_COURSES.has(v), 'Invalid course selection')
    .optional(),
  semester: z
    .string()
    .min(1, 'Semester is required')
    .max(50)
    .refine((v) => VALID_SEMESTERS.has(v), 'Invalid semester selection')
    .optional(),
  enrollmentNumber: z
    .string()
    .min(1, 'Enrollment number is required')
    .max(30)
    .regex(/^GA/i, 'Enrollment number must start with GA')
    .optional(),
  universityId: z
    .string()
    .min(1, 'University ID is required')
    .max(20)
    .regex(/^\d+$/, 'University ID must contain numbers only')
    .optional(),
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
