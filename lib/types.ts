export type Role = 'Attendee' | 'Volunteer' | 'Faculty' | 'Admin' | 'Lead';
export type ApplicationStatus = 'pending' | 'accepted' | 'waitlisted' | 'rejected' | 'not_eligible';
export type EventType = 'open' | 'registration' | 'restricted' | 'shortlisted';

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

export interface SubEvent {
  id: string;
  name: string;
  description: string;
  date: string;
  day: 1 | 2;
  startTime: string;
  endTime: string;
  venue: string;
  type: EventType;
  targetAudience: string;
  capacity: number | null;
  currentRegistrations: number;
  requiresShortlisting: boolean;
  coordinatorName: string;
  status: 'published' | 'draft' | 'archived';
  createdAt: number;
  updatedAt: number;
}

export interface SubEventApplication {
  id?: string;
  uid: string;
  subEventId: string;
  userName: string;
  userEmail: string;
  status: ApplicationStatus;
  decidedBy?: string;
  decidedAt?: number;
  notes?: string;
  checkedIn: boolean;
  checkedInAt?: number;
  checkedInBy?: string;
  deskId?: string;
  appliedAt: number;
}

export interface ClearancePass {
  uid: string;
  passId: string;
  qrToken: string;
  issuedAt: number;
  revoked: boolean;
  userName: string;
  userEmail: string;
  userRole: Role;
}

export interface Desk {
  id: string;
  subEventId: string;
  subEventName: string;
  venue: string;
  assignedVolunteerUids: string[];
}

export interface Announcement {
  id?: string;
  title: string;
  body: string;
  audience: string;
  priority: 'low' | 'normal' | 'high';
  createdAt: number;
  createdBy: string;
}

export interface ScanLog {
  id?: string;
  passId: string;
  uid: string;
  userName: string;
  scannedByUid: string;
  eventId: string;
  eventName: string;
  result: 'allowed' | 'denied' | 'already_checked_in';
  reason?: string;
  timestamp: number;
}

// ── Certificate Types (planned, not built yet) ──
// These types are forward-declared for the future certificate engine.
// See implementation_plan.md for the full certificate engine architecture.

export interface CertificateTemplate {
  id: string;
  name: string;
  eventId: string;
  type: 'participation' | 'achievement' | 'completion';
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
