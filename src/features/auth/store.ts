import { create } from "zustand";
import { tokenStore } from "@/lib/api/tokens";
import { readPersistedUser, writePersistedUser } from "@/features/auth/persisted-user";
import type { AuthSession, User } from "@/features/auth/schemas";

export type AuthStatus = "unknown" | "authenticated" | "unauthenticated";

interface AuthState {
  status: AuthStatus;
  user: User | null;
  /** Persist tokens + user and mark the session authenticated. */
  applySession: (session: AuthSession) => void;
  /** Patch the in-memory (and persisted) user, e.g. after profile changes. */
  setUser: (user: User) => void;
  /**
   * Restore the session from storage on load: if we hold tokens and a cached
   * user, we're authenticated immediately (no network). The access token is
   * validated lazily — the API client refreshes it on the first 401.
   */
  hydrateFromStorage: () => void;
  /** Clear tokens + session (sign out). */
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: "unknown",
  user: null,
  applySession: (session) => {
    tokenStore.save(session.accessToken, session.refreshToken);
    writePersistedUser(session.user);
    set({ status: "authenticated", user: session.user });
  },
  setUser: (user) => {
    writePersistedUser(user);
    set({ user });
  },
  hydrateFromStorage: () => {
    const user = readPersistedUser();
    if (tokenStore.hasTokens() && user) set({ status: "authenticated", user });
    else set({ status: "unauthenticated", user: null });
  },
  clear: () => {
    tokenStore.clear();
    writePersistedUser(null);
    set({ status: "unauthenticated", user: null });
  },
}));

/** Selectors (stable references avoid needless re-renders). */
export const selectUser = (s: AuthState) => s.user;
export const selectStatus = (s: AuthState) => s.status;
