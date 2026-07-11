import type { User } from "@/features/auth/schemas";

/**
 * The signed-in user is cached in localStorage so a page reload can restore the
 * session instantly from storage — no network round-trip, no logout risk. The
 * access token is trusted until a real request 401s, at which point the API
 * client refreshes it lazily (mirrors the mobile reference's bootstrap).
 */
const USER_KEY = "ventura.user";

export function readPersistedUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function writePersistedUser(user: User | null): void {
  if (typeof window === "undefined") return;
  if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(USER_KEY);
}
