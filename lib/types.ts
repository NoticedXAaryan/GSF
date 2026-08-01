// ── Role & Enum Types ──

export type Role = "admin" | "attendee" | "volunteer" | "lead" | "faculty";

export type EventType = "open" | "registration" | "restricted" | "shortlisted";

export type EventStatus = "draft" | "published" | "archived";

export type ApplicationStatus =
  | "pending"
  | "accepted"
  | "waitlisted"
  | "rejected";

export type ScanResult = "allowed" | "denied" | "already_checked_in";

export type AnnouncementPriority = "low" | "normal" | "high";

/** Audience can be "all", a role name, or a sub-event ID */
export type AudienceTarget = "all" | string;

// ── Core Interfaces ──

export interface Pass {
  passId: string;
  qrToken: string;
  uid: string;
  issuedAt: number;
  revoked: boolean;
}

export interface Task {
  id: string;
  checklistId: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  completedAt: number | null;
  sortOrder: number;
}

export interface TaskChecklist {
  id: string;
  subEventId: string;
  leadUid: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  tasks: Task[];
}

export interface SubEvent {
  id: string;
  name: string;
  description: string;
  date: string;
  day: number;
  startTime: string;
  endTime: string;
  venue: string;
  type: EventType;
  status: EventStatus;
  capacity: number | null;
  currentRegistrations: number;
  coordinatorName: string;
  targetAudience: string;
}

export interface Application {
  id: string;
  uid: string;
  subEventId: string;
  status: ApplicationStatus;
  appliedAt: number;
  decidedBy: string | null;
  decidedAt: number | null;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  priority: AnnouncementPriority;
  audience: string;
  createdAt: number;
  createdBy: string;
}

export interface ScanLog {
  id: string;
  passId: string;
  attendeeUid: string;
  scannerUid: string;
  subEventId: string;
  result: ScanResult;
  reason: string;
  timestamp: number;
}

// ── Extended Types (used by existing code) ──

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  collegeDept: string;
  year: string;
  organization: string;
  passId: string;
  createdAt: number;
  updatedAt: number;
}

export interface ClearancePass extends Pass {
  userName: string;
  userEmail: string;
  userRole: Role;
}

export interface SubEventApplication extends Application {
  userName?: string;
  userEmail?: string;
  notes?: string;
  checkedIn?: boolean;
  checkedInAt?: number;
  checkedInBy?: string;
  deskId?: string;
}

export interface Desk {
  id: string;
  subEventId: string;
  subEventName: string;
  venue: string;
  assignedVolunteerUids: string[];
}

// ── Certificate Types (planned, not built yet) ──

export interface CertificateTemplate {
  id: string;
  name: string;
  eventId: string;
  type: "participation" | "achievement" | "completion";
  templateUrl: string;
  fields: string[];
  createdAt: number;
}

export interface Certificate {
  id: string;
  uid: string;
  eventId: string;
  templateId: string;
  verificationCode: string;
  issuedAt: number;
  downloadUrl: string;
  userName: string;
  eventName: string;
}
