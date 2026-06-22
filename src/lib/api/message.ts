import { ApiError } from "@/lib/api/errors";

/** Best human-readable message for any thrown error (for toasts/inline errors). */
export function errorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
