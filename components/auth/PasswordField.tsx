"use client";

import { forwardRef, useId, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
}

/**
 * Extends AuthTextField pattern with password visibility toggle.
 * Toggle is accessible (aria-label, not tab-stealing) and respects disabled state.
 */
const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ label, error, disabled, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const [visible, setVisible] = useState(false);

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="mb-[var(--spacing-1)] block text-sm font-medium text-ink-muted"
        >
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            type={visible ? "text" : "password"}
            id={inputId}
            disabled={disabled}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              "w-full rounded-[var(--radius-sm)] border border-surface-alt bg-surface px-[var(--spacing-3)] py-[var(--spacing-2)] pr-[var(--spacing-12)] text-ink",
              "placeholder:text-ink-muted/50",
              "focus:outline-none focus:ring-2 focus:ring-focus focus:border-focus",
              "transition-colors duration-150",
              disabled && "opacity-50 cursor-not-allowed",
              error && "border-primary focus:ring-primary focus:border-primary",
              className,
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            disabled={disabled}
            aria-label={visible ? "Hide password" : "Show password"}
            className={cn(
              "absolute right-[var(--spacing-3)] top-1/2 -translate-y-1/2",
              "text-ink-muted hover:text-ink transition-colors",
              "min-w-[44px] min-h-[44px] flex items-center justify-center",
              disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            {visible ? (
              <EyeOff className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Eye className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {error && (
          <p
            id={errorId}
            className="mt-[var(--spacing-1)] text-sm text-primary"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

PasswordField.displayName = "PasswordField";

export { PasswordField };
