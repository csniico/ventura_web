import { create } from "zustand";
import { tokenStore } from "@/lib/api/tokens";
import type { AuthSession, User } from "@/features/auth/schemas";

export type AuthStatus = "unknown" | "authenticated" | "unauthenticated";

interface AuthState {
  status: AuthStatus;
  user: User | null;
  /** Persist tokens + mark the session authenticated. */
  applySession: (session: AuthSession) => void;
  /** Patch the in-memory user (e.g. after profile/business changes). */
  setUser: (user: User) => void;
  /** Mark resolved-but-signed-out (used by bootstrap when no valid token). */
  markUnauthenticated: () => void;
  /** Clear tokens + session (sign out). */
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: "unknown",
  user: null,
  applySession: (session) => {
    tokenStore.save(session.accessToken, session.refreshToken);
    set({ status: "authenticated", user: session.user });
  },
  setUser: (user) => set({ user }),
  markUnauthenticated: () => set({ status: "unauthenticated", user: null }),
  clear: () => {
    tokenStore.clear();
    set({ status: "unauthenticated", user: null });
  },
}));

/** Selectors (stable references avoid needless re-renders). */
export const selectUser = (s: AuthState) => s.user;
export const selectStatus = (s: AuthState) => s.status;
