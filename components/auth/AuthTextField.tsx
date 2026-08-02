"use client";

import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface AuthTextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  type?: "text" | "email";
  label: string;
  error?: string;
}

/**
 * Token-styled text input with label, inline error via aria-describedby,
 * and disabled state support from auth form policy.
 */
const AuthTextField = forwardRef<HTMLInputElement, AuthTextFieldProps>(
  ({ label, error, type = "text", disabled, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="mb-[var(--spacing-1)] block text-sm font-medium text-ink-muted"
        >
          {label}
        </label>
        <input
          ref={ref}
          type={type}
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "w-full rounded-[var(--radius-sm)] border border-surface-alt bg-surface px-[var(--spacing-3)] py-[var(--spacing-2)] text-ink",
            "placeholder:text-ink-muted/50",
            "focus:outline-none focus:ring-2 focus:ring-focus focus:border-focus",
            "transition-colors duration-150",
            disabled && "opacity-50 cursor-not-allowed",
            error && "border-primary focus:ring-primary focus:border-primary",
            className,
          )}
          {...props}
        />
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

AuthTextField.displayName = "AuthTextField";

export { AuthTextField };
