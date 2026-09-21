"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";
import { ApiError } from "@/lib/api/errors";
import { env } from "@/lib/env";
import { AuthBootstrap } from "@/features/auth/bootstrap";

export function Providers({ children }: { children: React.ReactNode }) {
  // One client per browser session; created lazily so it isn't shared across
  // requests on the server.
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: (failureCount, error) => {
              if (error instanceof ApiError) {
                // "rate-limit" included: retrying a 429 only deepens the throttle.
                if (
                  ["auth", "no-business", "validation", "not-found", "rate-limit"].includes(
                    error.kind,
                  )
                ) {
                  return false;
                }
              }
              return failureCount < 2;
            },
          },
        },
      }),
  );

  const tree = (
    <QueryClientProvider client={client}>
      <AuthBootstrap>{children}</AuthBootstrap>
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  );

  // Only mount the Google provider when configured, so the app runs without it.
  return env.googleClientId ? (
    <GoogleOAuthProvider clientId={env.googleClientId}>{tree}</GoogleOAuthProvider>
  ) : (
    tree
  );
}
