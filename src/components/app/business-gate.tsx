"use client";

import { Spinner } from "@/components/ui/misc";
import { AppShell } from "@/components/app/app-shell";
import { useMyBusiness } from "@/features/business/hooks";
import { OnboardingFlow } from "@/features/business/onboarding-flow";

/**
 * Gates the whole authenticated app on having a business. Until one exists,
 * only the onboarding flow is shown — the app shell (nav, search) and every
 * business-scoped screen stay unmounted, since the API 403s without a business.
 */
export function BusinessGate({ children }: { children: React.ReactNode }) {
  const business = useMyBusiness();

  if (business.isLoading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-zinc-50">
        <Spinner className="size-7" />
      </div>
    );
  }

  if (!business.data) return <OnboardingFlow />;

  return <AppShell>{children}</AppShell>;
}
