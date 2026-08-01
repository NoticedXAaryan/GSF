'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
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
  Menu,
  X,
  LogOut,
} from 'lucide-react';

interface NavLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

function getNavLinks(role: string): NavLink[] {
  const normalizedRole = role.toLowerCase();

  if (normalizedRole === 'admin' || normalizedRole === 'lead') {
    return [
      { label: 'Admin Panel', href: '/dashboard/admin', icon: <Shield className="w-5 h-5" /> },
      { label: 'Users', href: '/dashboard/admin/users', icon: <Users className="w-5 h-5" /> },
      { label: 'Events', href: '/dashboard/admin/events', icon: <Calendar className="w-5 h-5" /> },
      { label: 'Announcements', href: '/dashboard/admin/announcements', icon: <Megaphone className="w-5 h-5" /> },
      { label: 'Tasks', href: '/dashboard/admin/tasks', icon: <ClipboardList className="w-5 h-5" /> },
    ];
  }

  if (normalizedRole === 'volunteer') {
    return [
      { label: 'My Assignments', href: '/dashboard/volunteer', icon: <ClipboardList className="w-5 h-5" /> },
      { label: 'Scanner', href: '/dashboard/volunteer/scanner', icon: <ScanLine className="w-5 h-5" /> },
      { label: 'Announcements', href: '/dashboard/volunteer/announcements', icon: <Megaphone className="w-5 h-5" /> },
    ];
  }

  // Attendee (default)
  return [
    { label: 'My Pass', href: '/dashboard/user', icon: <Ticket className="w-5 h-5" /> },
    { label: 'Applications', href: '/dashboard/user/applications', icon: <FileText className="w-5 h-5" /> },
    { label: 'Schedule', href: '/dashboard/user/schedule', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Announcements', href: '/dashboard/user/announcements', icon: <Megaphone className="w-5 h-5" /> },
  ];
}

function handleLogout() {
  signOut({ fetchOptions: { onSuccess: () => { window.location.href = '/'; } } });
}

export function DashboardShell({
  role,
  userName,
  children,
}: {
  role: string;
  userName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = getNavLinks(role);

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col bg-white border-r border-gray-200 z-30">
        <div className="flex flex-col h-full">
          {/* Logo / Brand */}
          <div className="flex items-center h-16 px-6 border-b border-gray-100">
            <Link href="/" className="text-lg font-semibold text-gray-900 truncate">
              GSF 2026
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}

            {/* Home link */}
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <Home className="w-5 h-5" />
              Home
            </Link>
          </nav>

          {/* User section & Logout */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                <p className="text-xs text-gray-500 capitalize">{role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 inset-x-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-30">
        <Link href="/" className="text-base font-semibold text-gray-900">
          GSF 2026
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile overlay menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white flex flex-col">
          <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200">
            <span className="text-base font-semibold text-gray-900">Menu</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors',
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Home className="w-5 h-5" />
              Home
            </Link>
          </nav>
          <div className="border-t border-gray-100 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                <p className="text-xs text-gray-500 capitalize">{role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around z-30">
        {navLinks.slice(0, 4).map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-2 py-1 min-w-[44px] min-h-[44px] rounded-lg transition-colors',
                isActive ? 'text-gray-900' : 'text-gray-400'
              )}
            >
              {link.icon}
              <span className="text-[10px] font-medium leading-tight">{link.label.split(' ').slice(-1)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content */}
      <main className="lg:pl-64 pt-14 lg:pt-0 pb-16 lg:pb-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
