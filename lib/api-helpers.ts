import { NextResponse } from 'next/server';
import { ZodError, ZodSchema } from 'zod';
import crypto from 'crypto';
import { auth } from './auth';

export type Role = 'Attendee' | 'Volunteer' | 'Faculty' | 'Admin' | 'Lead';

const ADMIN_ROLES: ReadonlySet<Role> = new Set(['Admin', 'Lead']);
const LEAD_ROLES: ReadonlySet<Role> = new Set(['Lead', 'Admin']);
const VOLUNTEER_ROLES: ReadonlySet<Role> = new Set(['Volunteer', 'Admin', 'Lead']);

// ────────────────────────────────────────────────────────────
// ID Generation
// ────────────────────────────────────────────────────────────

/**
 * Cryptographically random pass ID.
 * Format: GSF-XXXX-XXXX — excludes ambiguous chars (I, O, 0, 1).
 */
export function generatePassId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(8);
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars[bytes[i] % chars.length];
  }
  return `GSF-${id.slice(0, 4)}-${id.slice(4, 8)}`;
}

export function generateQRToken(): string {
  return crypto.randomUUID();
}

export function generateId(): string {
  return crypto.randomUUID();
}

// ────────────────────────────────────────────────────────────
// Response Helpers
// ────────────────────────────────────────────────────────────

export function jsonResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { error: message, ...(details ? { details } : {}) },
    { status }
  );
}

// ────────────────────────────────────────────────────────────
// Input Validation
// ────────────────────────────────────────────────────────────

/**
 * Parse request body against a Zod schema. Returns the validated data
 * or a formatted error response.
 */
export async function parseBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<{ data: T; error?: never } | { data?: never; error: NextResponse }> {
  try {
    const raw = await request.json();
    const data = schema.parse(raw);
    return { data };
  } catch (err) {
    if (err instanceof ZodError) {
      const messages = err.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`);
      return {
        error: errorResponse('Validation failed', 422, messages),
      };
    }
    return { error: errorResponse('Invalid request body', 400) };
  }
}

// ────────────────────────────────────────────────────────────
// Auth Helpers — Session-based, no spoofable headers
// ────────────────────────────────────────────────────────────

interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
  [key: string]: unknown;
}

interface AuthSession {
  user: AuthUser;
  session: { id: string; expiresAt: Date; token: string };
}

/**
 * Get the authenticated session from the request cookies.
 * This uses Better Auth's server-side session verification —
 * the session token is in an HttpOnly cookie, not a spoofable header.
 */
export async function getSession(headers: Headers): Promise<AuthSession | null> {
  try {
    const sessionData = await auth.api.getSession({ headers });
    if (!sessionData?.user) return null;

    const user = sessionData.user as AuthUser;
    user.role = (user.role as Role) || 'Attendee';

    return sessionData as unknown as AuthSession;
  } catch {
    return null;
  }
}

/**
 * Require a valid session. Returns null if not authenticated.
 * Routes should return a 401 error response when null is returned.
 */
export async function requireSession(headers: Headers): Promise<AuthSession | null> {
  return getSession(headers);
}

/**
 * Require admin role (Admin or Lead). Returns null if not authenticated or not admin.
 * Routes should return a 403 error response when null is returned.
 */
export async function requireAdmin(headers: Headers): Promise<AuthSession | null> {
  const session = await getSession(headers);
  if (!session) return null;
  if (!ADMIN_ROLES.has(session.user.role)) return null;
  return session;
}

/**
 * Require Lead or Admin role. Returns null if not authenticated or lacks the role.
 * Routes should return a 403 error response when null is returned.
 */
export async function requireLead(headers: Headers): Promise<AuthSession | null> {
  const session = await getSession(headers);
  if (!session) return null;
  if (!LEAD_ROLES.has(session.user.role)) return null;
  return session;
}

/**
 * Require volunteer-or-above role (Volunteer, Lead, or Admin).
 * Returns null if not authenticated or lacks the role.
 * Routes should return a 403 error response when null is returned.
 */
export async function requireVolunteer(headers: Headers): Promise<AuthSession | null> {
  const session = await getSession(headers);
  if (!session) return null;
  if (!VOLUNTEER_ROLES.has(session.user.role)) return null;
  return session;
}

// ────────────────────────────────────────────────────────────
// Auth Helpers — With Error Response (discriminated union pattern)
// ────────────────────────────────────────────────────────────

type AuthResult =
  | { session: AuthSession; error?: never }
  | { session?: never; error: NextResponse };

/**
 * Require a valid session with built-in error response.
 * Returns a 401 error response if not authenticated.
 */
export async function requireSessionWithResponse(headers: Headers): Promise<AuthResult> {
  const session = await getSession(headers);
  if (!session) {
    return { error: errorResponse('Unauthorized', 401) };
  }
  return { session };
}

/**
 * Require admin role with built-in error response.
 * Returns 401 if not authenticated, 403 if insufficient role.
 */
export async function requireAdminWithResponse(headers: Headers): Promise<AuthResult> {
  const session = await getSession(headers);
  if (!session) {
    return { error: errorResponse('Unauthorized', 401) };
  }
  if (!ADMIN_ROLES.has(session.user.role)) {
    return { error: errorResponse('Unauthorized. Admin access required.', 403) };
  }
  return { session };
}

/**
 * Require Lead or Admin role with built-in error response.
 * Returns 401 if not authenticated, 403 if insufficient role.
 */
export async function requireLeadWithResponse(headers: Headers): Promise<AuthResult> {
  const session = await getSession(headers);
  if (!session) {
    return { error: errorResponse('Unauthorized', 401) };
  }
  if (!LEAD_ROLES.has(session.user.role)) {
    return { error: errorResponse('Unauthorized. Lead access required.', 403) };
  }
  return { session };
}

/**
 * Require volunteer-or-above role with built-in error response.
 * Returns 401 if not authenticated, 403 if insufficient role.
 */
export async function requireVolunteerWithResponse(headers: Headers): Promise<AuthResult> {
  const session = await getSession(headers);
  if (!session) {
    return { error: errorResponse('Unauthorized', 401) };
  }
  if (!VOLUNTEER_ROLES.has(session.user.role)) {
    return { error: errorResponse('Unauthorized. Volunteer access required.', 403) };
  }
  return { session };
}

// ────────────────────────────────────────────────────────────
// Role Checks
// ────────────────────────────────────────────────────────────

export function isAdmin(role: string): boolean {
  return ADMIN_ROLES.has(role as Role);
}

export function isLead(role: string): boolean {
  return LEAD_ROLES.has(role as Role);
}

export function isVolunteer(role: string): boolean {
  return VOLUNTEER_ROLES.has(role as Role);
}
