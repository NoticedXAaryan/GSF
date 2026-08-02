"use client";

import { AlertCircle } from "lucide-react";

export interface ApiErrorBannerProps {
  /** The error message to display. When null/undefined/empty, banner is not rendered. */
  message: string | null | undefined;
}

/**
 * Accessible API error banner with role="alert" and aria-live="assertive".
 * Uses design system tokens for styling. Appears above the form when an API
 * error occurs and is immediately announced to screen readers.
 */
export function ApiErrorBanner({ message }: ApiErrorBannerProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="mb-[var(--spacing-4)] rounded-[var(--radius-sm)] border border-primary/20 bg-primary/5 px-[var(--spacing-4)] py-[var(--spacing-3)] flex items-start gap-[var(--spacing-3)]"
    >
      <AlertCircle
        className="w-5 h-5 text-primary shrink-0"
        aria-hidden="true"
      />
      <p className="text-sm text-primary">{message}</p>
    </div>
  );
}
