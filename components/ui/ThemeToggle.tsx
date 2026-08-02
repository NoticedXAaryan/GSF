'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Theme switch.
 *
 * Which icon shows is decided purely by CSS via the `dark:` variant, reading
 * the `.dark` class that next-themes writes to <html> before paint. That keeps
 * this component stateless, so there is no hydration mismatch and no
 * mount-gate flicker.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme } = useTheme();

  function toggle() {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'light' : 'dark');
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle colour theme"
      title="Toggle colour theme"
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full bg-panel-alt text-fg-dim transition-colors hover:text-fg',
        className
      )}
    >
      <Sun className="h-4 w-4 dark:hidden" aria-hidden="true" />
      <Moon className="hidden h-4 w-4 dark:block" aria-hidden="true" />
    </button>
  );
}
