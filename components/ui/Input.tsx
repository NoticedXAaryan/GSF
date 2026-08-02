"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  type?: "text" | "email" | "password" | "tel" | "number" | "date";
  label?: string;
  error?: string;
  labelClassName?: string;
  errorClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, labelClassName, errorClassName, disabled, id, ...props }, ref) => {
    const inputId = id || props.name || undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-dim",
              labelClassName
            )}
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          ref={ref}
          disabled={disabled}
          className={cn(
            "w-full rounded-tile border border-line bg-panel-alt px-4 py-3 text-sm font-medium text-fg placeholder:text-fg-dim/70",
            "focus:border-lime focus:outline-none focus:ring-1 focus:ring-lime",
            "transition-colors duration-150",
            disabled && "cursor-not-allowed opacity-50",
            error && "border-magenta focus:border-magenta focus:ring-magenta",
            className
          )}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error && inputId ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={inputId ? `${inputId}-error` : undefined}
            className={cn("mt-1.5 text-xs font-semibold text-magenta", errorClassName)}
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
