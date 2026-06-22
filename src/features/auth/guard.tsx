"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store";
import { FullPageSpinner } from "@/components/ui/misc";

/** Gates authenticated areas. Redirects to /login once resolved-unauthenticated. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status !== "authenticated") return <FullPageSpinner />;
  return <>{children}</>;
}

/** For public/auth pages: bounces signed-in users into the app. */
export function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  if (status === "unknown") return <FullPageSpinner />;
  if (status === "authenticated") return <FullPageSpinner />;
  return <>{children}</>;
}
