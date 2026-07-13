"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Onboarding is now handled by the business gate in the app layout (shown until
 * a business exists). This route only renders for users who already have one,
 * so it just forwards to the dashboard.
 */
export default function OnboardingRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);
  return null;
}
