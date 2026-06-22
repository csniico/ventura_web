"use client";

import { useEffect, useRef } from "react";
import { refreshSession } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/store";
import { tokenStore } from "@/lib/api/tokens";
import { setOnAuthLost } from "@/lib/api/client";

/**
 * Resolves the session once on app load:
 *  - hold a refresh token → call /auth/refresh to get fresh tokens + user
 *  - otherwise → unauthenticated
 * Also wires the API client's "auth lost" hook to sign the user out when a
 * mid-session refresh fails.
 */
export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const applySession = useAuthStore((s) => s.applySession);
  const markUnauthenticated = useAuthStore((s) => s.markUnauthenticated);
  const clear = useAuthStore((s) => s.clear);
  const started = useRef(false);

  useEffect(() => {
    setOnAuthLost(() => clear());

    if (started.current) return;
    started.current = true;

    if (!tokenStore.hasTokens()) {
      markUnauthenticated();
      return;
    }

    refreshSession().then((session) => {
      if (session) applySession(session);
      else clear();
    });

    return () => setOnAuthLost(null);
  }, [applySession, markUnauthenticated, clear]);

  return <>{children}</>;
}
