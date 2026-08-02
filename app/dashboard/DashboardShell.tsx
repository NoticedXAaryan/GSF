'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProfileSettingsModal } from '@/components/dashboard/ProfileSettingsModal';
import { signOut } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  Home,
  Shield,
  Users,
  Calendar,
  Megaphone,
  ClipboardList,
  ScanLine,
  Ticket,
  FileText,
  LogOut,
  ArrowUpRight,
  UserCheck,
} from 'lucide-react';

interface NavLink {
  label: string;
  /** Short label for the compact mobile dock. */
  short: string;
  href: string;
  icon: React.ReactNode;
  /** Match this route exactly instead of by prefix. */
  exact?: boolean;
}

const ICON = 'h-[18px] w-[18px]';

function getNavLinks(role: string): NavLink[] {
  const normalizedRole = role.toLowerCase();

  if (normalizedRole === 'admin' || normalizedRole === 'lead') {
    return [
      { label: 'Overview', short: 'Home', href: '/dashboard/admin', icon: <Shield className={ICON} />, exact: true },
      { label: 'Users', short: 'Users', href: '/dashboard/admin/users', icon: <Users className={ICON} /> },
      { label: 'Events', short: 'Events', href: '/dashboard/admin/events', icon: <Calendar className={ICON} /> },
      { label: 'Applications', short: 'Apps', href: '/dashboard/admin/applications', icon: <FileText className={ICON} /> },
      { label: 'Volunteers', short: 'Vols', href: '/dashboard/admin/volunteers', icon: <UserCheck className={ICON} /> },
      { label: 'Scanner', short: 'Scan', href: '/dashboard/admin/scanner', icon: <ScanLine className={ICON} /> },
      { label: 'Announcements', short: 'News', href: '/dashboard/admin/announcements', icon: <Megaphone className={ICON} /> },
      { label: 'Tasks', short: 'Tasks', href: '/dashboard/admin/tasks', icon: <ClipboardList className={ICON} /> },
      { label: 'My Pass', short: 'Pass', href: '/dashboard/admin/pass', icon: <Ticket className={ICON} /> },
    ];
  }

  if (normalizedRole === 'volunteer') {
    return [
      { label: 'Assignments', short: 'Tasks', href: '/dashboard/volunteer', icon: <ClipboardList className={ICON} />, exact: true },
      { label: 'Scanner', short: 'Scan', href: '/dashboard/volunteer/scanner', icon: <ScanLine className={ICON} /> },
      { label: 'Announcements', short: 'News', href: '/dashboard/volunteer/announcements', icon: <Megaphone className={ICON} /> },
    ];
  }

  // Attendee (default)
  return [
    { label: 'Home', short: 'Home', href: '/dashboard/user', icon: <Home className={ICON} />, exact: true },
    { label: 'My Pass', short: 'Pass', href: '/dashboard/user/pass', icon: <Ticket className={ICON} /> },
    { label: 'Applications', short: 'Apps', href: '/dashboard/user/applications', icon: <FileText className={ICON} /> },
    { label: 'Schedule', short: 'Events', href: '/dashboard/user/schedule', icon: <Calendar className={ICON} /> },
    { label: 'Announcements', short: 'News', href: '/dashboard/user/announcements', icon: <Megaphone className={ICON} /> },
  ];
}

function isLinkActive(pathname: string, link: NavLink): boolean {
  if (link.exact) return pathname === link.href;
  return pathname === link.href || pathname.startsWith(link.href + '/');
}

function handleLogout() {
  signOut({ fetchOptions: { onSuccess: () => { window.location.href = '/'; } } });
}

function UserAvatar({
  userName,
  userImage,
  size = 36,
}: {
  userName: string;
  userImage?: string | null;
  size?: number;
}) {
  if (userImage) {
    return (
      <Image
        src={userImage}
        alt={userName}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full bg-primary text-sm font-bold text-surface"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {userName.charAt(0).toUpperCase()}
    </div>
  );
}

export function DashboardShell({
  role,
  userName,
  userImage,
  children,
}: {
  role: string;
  userName: string;
  userImage?: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const navLinks = getNavLinks(role);
  const [signingOut, setSigningOut] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const activeLink = navLinks.find((l) => isLinkActive(pathname, l));

  return (
    <div className="min-h-screen bg-dsh text-fg">
      {/* ---------- Desktop sidebar ---------- */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[272px] flex-col p-3 lg:flex">
        <div className="flex h-full flex-col rounded-bento border border-line bg-panel p-4">
          {/* Brand */}
          <div className="flex items-center justify-between px-1 py-2">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="GSF Logo" className="h-10 w-auto object-contain rounded-sm" />
            </Link>
            <ThemeToggle />
          </div>

          {/* Nav */}
          <nav className="mt-5 flex-1 space-y-1 overflow-y-auto" aria-label="Dashboard">
            {navLinks.map((link) => {
              const active = isLinkActive(pathname, link);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-tile px-3 py-2.5 text-sm font-semibold tracking-tight transition-colors',
                    active
                      ? 'bg-primary text-surface'
                      : 'text-fg-dim hover:bg-panel-alt hover:text-fg'
                  )}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Back to site */}
          <Link
            href="/"
            className="mt-3 flex items-center justify-between rounded-tile bg-panel-alt px-3 py-2.5 text-xs font-semibold tracking-tight text-fg-dim transition-colors hover:text-fg"
          >
            Festival site
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>

          {/* User */}
          <div className="mt-3 rounded-tile bg-panel-alt p-3">
            <div 
              className="flex items-center gap-3 cursor-pointer rounded-md p-1 hover:bg-surface-alt transition-colors"
              onClick={() => setIsProfileModalOpen(true)}
            >
              <UserAvatar userName={userName} userImage={userImage} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold tracking-tight hover:underline">{userName}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-dim">
                  {role}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSigningOut(true);
                handleLogout();
              }}
              disabled={signingOut}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-primary-strong px-3 py-2 text-xs font-bold tracking-tight text-surface transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              {signingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      </aside>

      {/* ---------- Mobile top bar ---------- */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-dsh/85 px-4 py-3 backdrop-blur-md lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="GSF Logo" className="h-8 w-auto object-contain rounded-sm" />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div 
            className="cursor-pointer"
            onClick={() => setIsProfileModalOpen(true)}
          >
            <UserAvatar userName={userName} userImage={userImage} size={32} />
          </div>
        </div>
      </header>

      {/* ---------- Main ---------- */}
      <main className="pb-28 lg:pb-0 lg:pl-[272px]">
        <div className="px-4 py-4 lg:px-8 lg:py-8">{children}</div>
      </main>

      {/* ---------- Mobile floating dock ---------- */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-2 pb-4 lg:hidden"
        aria-label="Dashboard"
      >
        <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-line bg-panel/95 p-1.5 shadow-lg backdrop-blur-xl hide-scrollbar">
          {navLinks.map((link) => {
            const active = isLinkActive(pathname, link);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                aria-label={link.label}
                className={cn(
                  'flex shrink-0 min-h-[44px] items-center justify-center gap-1.5 rounded-full transition-all duration-200',
                  active
                    ? 'bg-primary px-3.5 text-surface'
                    : 'w-11 text-fg-dim hover:text-fg'
                )}
              >
                {link.icon}
                {active && (
                  <span className="text-xs font-bold tracking-tight whitespace-nowrap">{link.short}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userName={userName}
        currentImage={userImage}
      />
    </div>
  );
}
