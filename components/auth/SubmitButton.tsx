"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SubmitButtonProps {
  /** Button label text */
  children: React.ReactNode;
  /** Whether the form is currently submitting */
  loading?: boolean;
  /** Whether the button is disabled (e.g., during any busy state) */
  disabled?: boolean;
}

/**
 * Form submit button with loading state and disabled behavior.
 * Uses design system primary color tokens and 44px minimum touch target.
 */
export function SubmitButton({
  children,
  loading = false,
  disabled = false,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      className={cn(
        "w-full inline-flex items-center justify-center",
        "rounded-[var(--radius-sm)] bg-primary text-surface font-medium",
        "px-[var(--spacing-6)] py-[var(--spacing-3)]",
        "hover:bg-primary-strong transition-colors duration-150",
        "min-h-[44px]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2",
      )}
    >
      {loading && (
        <Loader2
          className="mr-[var(--spacing-2)] h-4 w-4 animate-spin"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
