/**
 * Maps backend / network errors into a small typed failure hierarchy, mirroring
 * the mobile reference (`lib/core/data/network/api_error.dart`).
 */

export type FailureKind =
  | "network"
  | "auth"
  | "no-business"
  | "validation"
  | "not-found"
  | "rate-limit"
  | "server"
  | "unknown";

export class ApiError extends Error {
  readonly kind: FailureKind;
  readonly status: number;

  constructor(kind: FailureKind, message: string, status = 0) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

/** Extract a human message from a NestJS error body (`message` is string or string[]). */
function messageFrom(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "message" in body) {
    const msg = (body as { message: unknown }).message;
    if (typeof msg === "string") return msg;
    if (Array.isArray(msg) && msg.length > 0) return String(msg[0]);
  }
  return fallback;
}

/** Build an ApiError from an HTTP response status + parsed body. */
export function failureFromResponse(status: number, body: unknown): ApiError {
  const message = messageFrom(body, "Something went wrong.");

  if (status === 401 || status === 403) {
    // The API signals "user has no business yet" via a 403 (see mobile reference).
    if (status === 403 && /create a business/i.test(message)) {
      return new ApiError("no-business", message, status);
    }
    return new ApiError("auth", message || "Not authorized.", status);
  }
  if (status === 404) return new ApiError("not-found", message, status);
  if (status === 400 || status === 422) {
    return new ApiError("validation", message || "Invalid request.", status);
  }
  // The API throttles; say so plainly instead of "Server error."
  if (status === 429) {
    return new ApiError("rate-limit", "Too many requests — please slow down and try again.", status);
  }
  return new ApiError("server", message || "Server error.", status);
}

export function networkFailure(): ApiError {
  return new ApiError("network", "Network error. Check your connection.");
}
