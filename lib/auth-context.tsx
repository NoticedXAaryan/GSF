'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useSession } from '@/lib/auth-client';

type Role = 'Attendee' | 'Volunteer' | 'Faculty' | 'Admin' | 'Lead';

const ADMIN_ROLES: Role[] = ['Admin', 'Lead'];
const VOLUNTEER_ROLES: Role[] = ['Volunteer', 'Admin', 'Lead'];

interface AuthState {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role: Role;
    phone: string;
    collegeDept: string;
    year: string;
    organization: string;
    passId: string;
    profileComplete: boolean;
  } | null;
  session: { id: string; expiresAt: Date } | null;
  loading: boolean;
  isAdmin: boolean;
  isVolunteer: boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: sessionData, isPending } = useSession();

  const value = useMemo<AuthState>(() => {
    if (!sessionData?.user) {
      return {
        user: null,
        session: null,
        loading: isPending,
        isAdmin: false,
        isVolunteer: false,
      };
    }

    const user = (sessionData.user as unknown) as AuthState['user'] & Record<string, unknown>;
    const role = ((user as unknown as Record<string, unknown>).role as Role) || 'Attendee';

    const normalizedUser: AuthState['user'] = {
      id: user!.id,
      name: user!.name,
      email: user!.email,
      image: user!.image,
      role,
      phone: ((user as Record<string, unknown>).phone as string) || '',
      collegeDept: ((user as Record<string, unknown>).collegeDept as string) || '',
      year: ((user as Record<string, unknown>).year as string) || '',
      organization: ((user as Record<string, unknown>).organization as string) || '',
      passId: ((user as Record<string, unknown>).passId as string) || '',
      profileComplete: ((user as Record<string, unknown>).profileComplete as boolean) || false,
    };

    return {
      user: normalizedUser,
      session: sessionData.session
        ? { id: sessionData.session.id, expiresAt: new Date(sessionData.session.expiresAt) }
        : null,
      loading: isPending,
      isAdmin: ADMIN_ROLES.includes(role),
      isVolunteer: VOLUNTEER_ROLES.includes(role),
    };
  }, [sessionData, isPending]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
