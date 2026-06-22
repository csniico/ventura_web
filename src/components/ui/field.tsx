import { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function Input({ className, invalid, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-zinc-900 shadow-sm transition-colors",
          "placeholder:text-zinc-400",
          "focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500",
          "disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500",
          invalid ? "border-red-400 focus:border-red-500 focus:ring-red-500/40" : "border-zinc-200",
          className,
        )}
        {...props}
      />
    );
  },
);

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  children: (props: { id: string; invalid: boolean }) => React.ReactNode;
}

/**
 * Labelled form field with accessible wiring (label↔control, error messaging).
 * Render-prop passes the generated id + invalid flag down to the control so the
 * field owns the a11y plumbing and the caller stays declarative.
 */
export function Field({ label, error, hint, children }: FieldProps) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-zinc-700">
        {label}
      </label>
      {children({ id, invalid: Boolean(error) })}
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-zinc-500">{hint}</p>
      ) : null}
    </div>
  );
}
