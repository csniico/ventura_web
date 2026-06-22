"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store";
import { Landing } from "@/components/landing/landing";

/**
 * Public marketing landing page. Signed-in users are bounced to the dashboard;
 * everyone else sees the landing immediately (no loading flash for visitors).
 */
export default function Home() {
  const status = useAuthStore((s) => s.status);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  return <Landing />;
}
