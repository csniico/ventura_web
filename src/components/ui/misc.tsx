import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

/** Wordmark used across auth + app chrome. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-gradient-primary text-sm font-bold text-white">
        V
      </span>
      <span className="text-lg font-semibold tracking-tight text-zinc-900">Ventura</span>
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-5 animate-spin text-primary-600", className)} aria-hidden />;
}

/** Full-viewport loading state for bootstrap / route transitions. */
export function FullPageSpinner() {
  return (
    <div className="grid flex-1 place-items-center" role="status" aria-label="Loading">
      <Spinner className="size-7" />
    </div>
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-zinc-200 bg-white shadow-sm", className)}
      {...props}
    />
  );
}
