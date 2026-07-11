"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/features/auth/store";
import { setOnAuthLost } from "@/lib/api/client";

/**
 * Restores the session once on app load, from storage only:
 *  - tokens + a cached user  → authenticated immediately (no network call)
 *  - otherwise               → unauthenticated
 *
 * The access token is NOT verified up front; the API client refreshes it
 * lazily on the first 401 and only signs the user out if that refresh fails.
 * This avoids a refresh round-trip (and a logout risk) on every page reload.
 */
export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const hydrateFromStorage = useAuthStore((s) => s.hydrateFromStorage);
  const clear = useAuthStore((s) => s.clear);
  const started = useRef(false);

  useEffect(() => {
    // Wire the client's "session lost" hook to sign out on a failed refresh.
    setOnAuthLost(() => clear());

    if (!started.current) {
      started.current = true;
      hydrateFromStorage();
    }

    return () => setOnAuthLost(null);
  }, [hydrateFromStorage, clear]);

  return <>{children}</>;
}
