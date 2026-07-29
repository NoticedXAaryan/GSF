"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Loader2 } from 'lucide-react';

export default function DashboardRootPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      router.replace('/login');
      return;
    }

    const role = session.user?.role || 'Attendee';
    if (role === 'Admin' || role === 'Lead') {
      router.replace('/dashboard/admin');
    } else if (role === 'Volunteer') {
      router.replace('/dashboard/volunteer');
    } else {
      router.replace('/dashboard/user');
    }
  }, [session, isPending, router]);

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-black/50" />
    </div>
  );
}
