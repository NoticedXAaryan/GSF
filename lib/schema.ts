import {
  pgTable,
  text,
  integer,
  boolean,
  bigint,
  timestamp,
  uniqueIndex,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';

// ────────────────────────────────────────────────────────────
// Enums
// ────────────────────────────────────────────────────────────

export const roleEnum = pgEnum('role', [
  'Attendee',
  'Volunteer',
  'Faculty',
  'Admin',
  'Lead',
]);

export const eventTypeEnum = pgEnum('event_type', [
  'open',
  'registration',
  'restricted',
  'shortlisted',
]);

export const eventStatusEnum = pgEnum('event_status', [
  'draft',
  'published',
  'archived',
]);

export const applicationStatusEnum = pgEnum('application_status', [
  'pending',
  'accepted',
  'waitlisted',
  'rejected',
  'not_eligible',
  'withdrawn',
]);

export const scanResultEnum = pgEnum('scan_result', [
  'allowed',
  'denied',
  'already_checked_in',
]);

export const announcementPriorityEnum = pgEnum('announcement_priority', [
  'low',
  'normal',
  'high',
]);

// ────────────────────────────────────────────────────────────
// Better Auth Core Tables
// These are managed by Better Auth but defined here so Drizzle
// can reference them in relations and type-safe queries.
// ────────────────────────────────────────────────────────────

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  // ── Extended fields ──
  role: text('role').notNull().default('Attendee'),
  phone: text('phone').default(''),
  collegeDept: text('college_dept').default(''),
  year: text('year').default(''),
  organization: text('organization').default(''),
  passId: text('pass_id').default(''),
  profileComplete: boolean('profile_complete').default(false),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ────────────────────────────────────────────────────────────
// Application Domain Tables
// ────────────────────────────────────────────────────────────

export const events = pgTable(
  'events',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description').default(''),
    date: text('date').notNull(),
    day: integer('day').notNull().default(1),
    startTime: text('start_time').notNull(),
    endTime: text('end_time').notNull(),
    venue: text('venue').notNull(),
    type: eventTypeEnum('type').notNull().default('open'),
    targetAudience: text('target_audience').default('all'),
    capacity: integer('capacity'),
    currentRegistrations: integer('current_registrations').default(0),
    requiresShortlisting: boolean('requires_shortlisting').default(false),
    coordinatorName: text('coordinator_name').default(''),
    status: eventStatusEnum('status').notNull().default('draft'),
    createdAt: bigint('created_at', { mode: 'number' }).notNull(),
    updatedAt: bigint('updated_at', { mode: 'number' }).notNull(),
  },
  (table) => [
    index('idx_events_status').on(table.status),
    index('idx_events_day').on(table.day),
  ]
);

export const applications = pgTable(
  'applications',
  {
    id: text('id').primaryKey(),
    uid: text('uid')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    subEventId: text('sub_event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    userName: text('user_name').notNull(),
    userEmail: text('user_email').notNull(),
    status: applicationStatusEnum('status').notNull().default('pending'),
    decidedBy: text('decided_by'),
    decidedAt: bigint('decided_at', { mode: 'number' }),
    notes: text('notes').default(''),
    checkedIn: boolean('checked_in').default(false),
    checkedInAt: bigint('checked_in_at', { mode: 'number' }),
    checkedInBy: text('checked_in_by'),
    deskId: text('desk_id'),
    appliedAt: bigint('applied_at', { mode: 'number' }).notNull(),
  },
  (table) => [
    uniqueIndex('idx_applications_uid_event').on(table.uid, table.subEventId),
    index('idx_applications_uid').on(table.uid),
    index('idx_applications_sub_event_id').on(table.subEventId),
    index('idx_applications_status').on(table.status),
  ]
);

export const clearancePasses = pgTable(
  'clearance_passes',
  {
    id: text('id').primaryKey(),
    uid: text('uid')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    passId: text('pass_id').notNull().unique(),
    qrToken: text('qr_token').notNull().unique(),
    issuedAt: bigint('issued_at', { mode: 'number' }).notNull(),
    revoked: boolean('revoked').default(false),
    userName: text('user_name').notNull(),
    userEmail: text('user_email').notNull(),
    userRole: text('user_role').default('Attendee'),
  },
  (table) => [
    index('idx_clearance_passes_uid').on(table.uid),
  ]
);

export const scanLogs = pgTable(
  'scan_logs',
  {
    id: text('id').primaryKey(),
    passId: text('pass_id').notNull(),
    uid: text('uid').notNull(),
    userName: text('user_name').notNull(),
    scannedByUid: text('scanned_by_uid').notNull(),
    eventId: text('event_id').notNull(),
    eventName: text('event_name').default(''),
    result: scanResultEnum('result').notNull(),
    reason: text('reason').default(''),
    timestamp: bigint('timestamp', { mode: 'number' }).notNull(),
  },
  (table) => [
    index('idx_scan_logs_uid').on(table.uid),
    index('idx_scan_logs_event_id').on(table.eventId),
    index('idx_scan_logs_timestamp').on(table.timestamp),
  ]
);

export const desks = pgTable('desks', {
  id: text('id').primaryKey(),
  subEventId: text('sub_event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  subEventName: text('sub_event_name').default(''),
  venue: text('venue').notNull(),
  assignedVolunteerUids: text('assigned_volunteer_uids').array().default([]),
});

export const announcements = pgTable(
  'announcements',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    audience: text('audience').default('all'),
    priority: announcementPriorityEnum('priority').notNull().default('normal'),
    createdAt: bigint('created_at', { mode: 'number' }).notNull(),
    createdBy: text('created_by')
      .notNull()
      .references(() => user.id),
  },
  (table) => [
    index('idx_announcements_created_at').on(table.createdAt),
  ]
);
