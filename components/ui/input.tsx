import * as React from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const fieldBase =
  "h-control-md w-full rounded-md border bg-surface px-3 text-body text-text-primary placeholder:text-text-muted transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-background-alt disabled:text-text-disabled";

interface FieldWrapProps {
  label?: string;
  error?: string;
  hint?: string;
  id?: string;
  required?: boolean;
}

function FieldChrome({
  label,
  error,
  hint,
  id,
  required,
  children,
}: FieldWrapProps & { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-label text-text-primary">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-[12.5px] text-danger">{error}</p>
      ) : hint ? (
        <p className="text-[12.5px] text-text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    FieldWrapProps {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, required, ...props }, ref) => (
    <FieldChrome label={label} error={error} hint={hint} id={id} required={required}>
      <input
        ref={ref}
        id={id}
        className={cn(
          fieldBase,
          error ? "border-danger focus:ring-danger/20" : "border-border focus:border-primary",
          className
        )}
        {...props}
      />
    </FieldChrome>
  )
);
Input.displayName = "Input";

export const SearchInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
      <input
        ref={ref}
        className={cn(fieldBase, "border-border pl-9 focus:border-primary", className)}
        {...props}
      />
    </div>
  )
);
SearchInput.displayName = "SearchInput";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & FieldWrapProps
>(({ className, label, error, hint, id, required, ...props }, ref) => (
  <FieldChrome label={label} error={error} hint={hint} id={id} required={required}>
    <textarea
      ref={ref}
      id={id}
      rows={4}
      className={cn(
        "w-full rounded-md border bg-surface px-3 py-2 text-body text-text-primary placeholder:text-text-muted transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20",
        error ? "border-danger focus:ring-danger/20" : "border-border focus:border-primary",
        className
      )}
      {...props}
    />
  </FieldChrome>
));
Textarea.displayName = "Textarea";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement>,
    FieldWrapProps {
  options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, id, required, options, ...props }, ref) => (
    <FieldChrome label={label} error={error} hint={hint} id={id} required={required}>
      <div className="relative">
        <select
          ref={ref}
          id={id}
          className={cn(
            fieldBase,
            "appearance-none pr-9",
            error ? "border-danger focus:ring-danger/20" : "border-border focus:border-primary",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
      </div>
    </FieldChrome>
  )
);
Select.displayName = "Select";

export function Checkbox({
  className,
  label,
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label htmlFor={id} className="inline-flex items-center gap-2 text-body text-text-primary">
      <span className="relative inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border border-border bg-surface peer-checked:bg-primary">
        <input
          type="checkbox"
          id={id}
          className={cn("peer absolute inset-0 h-full w-full cursor-pointer opacity-0", className)}
          {...props}
        />
        <Check className="hidden h-3 w-3 text-white peer-checked:block" />
      </span>
      {label}
    </label>
  );
}

export function Radio({
  className,
  label,
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label htmlFor={id} className="inline-flex items-center gap-2 text-body text-text-primary">
      <span className="relative inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-border bg-surface">
        <input
          type="radio"
          id={id}
          className={cn("peer absolute inset-0 h-full w-full cursor-pointer opacity-0", className)}
          {...props}
        />
        <span className="hidden h-2 w-2 rounded-full bg-primary peer-checked:block" />
      </span>
      {label}
    </label>
  );
}

export function Switch({
  checked,
  onChange,
  id,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  className?: string;
}) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150",
        checked ? "bg-primary" : "bg-border-strong",
        className
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-card transition-transform duration-150",
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}
