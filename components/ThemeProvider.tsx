'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * Theme provider scoped to dashboard theming.
 * Uses the `class` strategy so Tailwind's `dark:` variant resolves against
 * the `.dark` class on <html>, which flips the --d-* runtime tokens.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
