"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Card, FullPageSpinner } from "@/components/ui/misc";
import { EmptyState } from "@/components/ui/data";
import { Button } from "@/components/ui/button";
import { useIsPlatformAdmin } from "@/features/admin/hooks";

/**
 * Gates the platform-admin console. Deliberately NOT behind BusinessGate: an
 * admin manages the platform and need not own a business, and the onboarding
 * flow would otherwise trap them.
 *
 * This is a convenience gate, not a security boundary — every /admin/* route
 * is enforced server-side by AdminGuard, and a non-admin who reaches these
 * screens gets 403s from the API regardless of what the UI renders.
 */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const admin = useIsPlatformAdmin();
  const router = useRouter();

  if (admin.isLoading) return <FullPageSpinner />;

  if (!admin.data) {
    return (
      <AppShell>
        <Card>
          <EmptyState
            icon={ShieldAlert}
            title="Administrator access required"
            description="This area is limited to platform administrators."
            action={
              <Button variant="secondary" onClick={() => router.push("/dashboard")}>
                Back to dashboard
              </Button>
            }
          />
        </Card>
      </AppShell>
    );
  }

  return <AppShell>{children}</AppShell>;
}
