"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  error?: string;
  placeholder?: string;
  options: SelectOption[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, error, placeholder, options, disabled, id, ...props },
    ref
  ) => {
    const selectId = id || props.name || undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-dim"
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          disabled={disabled}
          className={cn(
            "w-full rounded-tile border border-line bg-panel-alt px-4 py-3 text-sm font-medium text-fg",
            "focus:border-lime focus:outline-none focus:ring-1 focus:ring-lime",
            "transition-colors duration-150",
            disabled && "cursor-not-allowed opacity-50",
            error && "border-magenta focus:border-magenta focus:ring-magenta",
            className
          )}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error && selectId ? `${selectId}-error` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled selected={!props.value && !props.defaultValue}>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p
            id={selectId ? `${selectId}-error` : undefined}
            className="mt-1.5 text-xs font-semibold text-magenta"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
